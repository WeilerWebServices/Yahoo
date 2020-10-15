# Adapted from: https://www.tensorflow.org/beta/tutorials/distribute/multi_worker_with_keras

from __future__ import absolute_import, division, print_function, unicode_literals


def main_fun(args, ctx):
  import tensorflow_datasets as tfds
  import tensorflow as tf
  from tensorflowonspark import compat

  tfds.disable_progress_bar()

  strategy = tf.distribute.experimental.MultiWorkerMirroredStrategy()

  BUFFER_SIZE = args.buffer_size
  BATCH_SIZE = args.batch_size
  NUM_WORKERS = args.cluster_size

  # Scaling MNIST data from (0, 255] to (0., 1.]
  def scale(image, label):
    return tf.cast(image, tf.float32) / 255, label

  # workaround for https://github.com/tensorflow/datasets/issues/1405
  datasets = tfds.load(name='mnist', split='train', as_supervised=True)
  options = tf.data.Options()
  options.experimental_distribute.auto_shard_policy = tf.data.experimental.AutoShardPolicy.DATA
  train_datasets_unbatched = datasets.with_options(options).repeat().map(scale).shuffle(BUFFER_SIZE)

  def build_and_compile_cnn_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(32, 3, activation='relu', input_shape=(28, 28, 1)),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    model.compile(
        loss=tf.keras.losses.sparse_categorical_crossentropy,
        optimizer=tf.keras.optimizers.SGD(learning_rate=0.001),
        metrics=['accuracy'])
    return model

  # single node
  # single_worker_model = build_and_compile_cnn_model()
  # single_worker_model.fit(x=train_datasets, epochs=3)

  # Here the batch size scales up by number of workers since
  # `tf.data.Dataset.batch` expects the global batch size. Previously we used 64,
  # and now this becomes 128.
  GLOBAL_BATCH_SIZE = BATCH_SIZE * NUM_WORKERS
  train_datasets = train_datasets_unbatched.batch(GLOBAL_BATCH_SIZE)

  # this fails
  # callbacks = [tf.keras.callbacks.ModelCheckpoint(filepath=args.model_dir)]
  tf.io.gfile.makedirs(args.model_dir)
  filepath = args.model_dir + "/weights-{epoch:04d}"
  callbacks = [
    tf.keras.callbacks.ModelCheckpoint(filepath=filepath, verbose=1, save_weights_only=True),
    tf.keras.callbacks.TensorBoard(log_dir=args.model_dir)
  ]

  with strategy.scope():
    multi_worker_model = build_and_compile_cnn_model()
  multi_worker_model.fit(x=train_datasets, epochs=args.epochs, steps_per_epoch=args.steps_per_epoch, callbacks=callbacks)

  from tensorflow_estimator.python.estimator.export import export_lib
  export_dir = export_lib.get_timestamped_export_dir(args.export_dir)
  compat.export_saved_model(multi_worker_model, export_dir, ctx.job_name == 'chief')


if __name__ == '__main__':
  import argparse
  from pyspark.context import SparkContext
  from pyspark.conf import SparkConf
  from tensorflowonspark import TFCluster

  sc = SparkContext(conf=SparkConf().setAppName("mnist_keras"))
  executors = sc._conf.get("spark.executor.instances")
  num_executors = int(executors) if executors is not None else 1

  parser = argparse.ArgumentParser()
  parser.add_argument("--batch_size", help="number of records per batch", type=int, default=64)
  parser.add_argument("--buffer_size", help="size of shuffle buffer", type=int, default=10000)
  parser.add_argument("--cluster_size", help="number of nodes in the cluster", type=int, default=num_executors)
  parser.add_argument("--epochs", help="number of epochs", type=int, default=3)
  parser.add_argument("--model_dir", help="path to save model/checkpoint", default="mnist_model")
  parser.add_argument("--export_dir", help="path to export saved_model", default="mnist_export")
  parser.add_argument("--steps_per_epoch", help="number of steps per epoch", type=int, default=469)
  parser.add_argument("--tensorboard", help="launch tensorboard process", action="store_true")

  args = parser.parse_args()
  print("args:", args)

  cluster = TFCluster.run(sc, main_fun, args, args.cluster_size, num_ps=0, tensorboard=args.tensorboard, input_mode=TFCluster.InputMode.TENSORFLOW, master_node='chief', log_dir=args.model_dir)
  cluster.shutdown()
