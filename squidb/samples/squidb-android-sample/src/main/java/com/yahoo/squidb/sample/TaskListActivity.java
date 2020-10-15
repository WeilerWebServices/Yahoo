/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the Apache 2.0 License.
 * See the accompanying LICENSE file for terms.
 */
package com.yahoo.squidb.sample;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.app.LoaderManager;
import android.content.DialogInterface;
import android.content.Loader;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.TextView;

import com.yahoo.squidb.android.SquidCursorLoader;
import com.yahoo.squidb.data.SquidCursor;
import com.yahoo.squidb.sample.database.TasksDatabase;
import com.yahoo.squidb.sample.models.Task;
import com.yahoo.squidb.sample.utils.TaskUtils;
import com.yahoo.squidb.sql.Query;

public class TaskListActivity extends Activity implements LoaderManager.LoaderCallbacks<SquidCursor<Task>> {

    private static final int LOADER_ID_TASKS = 1;

    private TaskUtils mTaskUtils = TaskUtils.getInstance();
    private ListView mTaskListView;
    private TaskListAdapter mTaskListAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_task_list);
        mTaskListView = (ListView) findViewById(R.id.task_list);

        mTaskListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                new EditTaskDialogFragment(mTaskListAdapter.getItem(position))
                        .show(getFragmentManager(), "EditTask");
            }
        });
        mTaskListAdapter = new TaskListAdapter(this, new Task());
        mTaskListView.setAdapter(mTaskListAdapter);

        View newTaskButton = findViewById(R.id.create_new_task);
        newTaskButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                new NewTaskDialogFragment().show(getFragmentManager(), "NewTask");
            }
        });
    }

    @SuppressLint("ValidFragment")
    private class EditTaskDialogFragment extends DialogFragment {

        private Task mTask;

        public EditTaskDialogFragment(Task task) {
            mTask = task.clone(); // We might be using a shared object, so clone the task to work with
        }

        @Override
        public Dialog onCreateDialog(Bundle savedInstanceState) {
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
            builder.setMessage(mTask.getTitle())
                    .setNegativeButton(android.R.string.cancel, null)
                    .setNeutralButton(R.string.complete_task, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            mTaskUtils.completeTask(mTask);
                        }
                    })
                    .setPositiveButton(R.string.delete_task, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            mTaskUtils.deleteTask(mTask);
                        }
                    });
            return builder.create();
        }
    }

    @SuppressLint("ValidFragment")
    private class NewTaskDialogFragment extends DialogFragment {

        @Override
        public Dialog onCreateDialog(Bundle savedInstanceState) {
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
            builder.setTitle(R.string.create_new_task);
            View view = getLayoutInflater().inflate(R.layout.new_task_dialog, null);
            final TextView taskTitle = (TextView) view.findViewById(R.id.task_title);
            final TextView taskTags = (TextView) view.findViewById(R.id.task_tags);
            builder.setView(view);
            builder.setNegativeButton(android.R.string.cancel, null)
                    .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            mTaskUtils.insertNewTask(taskTitle.getText().toString(), 0, 0,
                                    taskTags.getText().toString());
                        }
                    });
            return builder.create();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        getLoaderManager().restartLoader(LOADER_ID_TASKS, null, this);
    }

    @Override
    public Loader<SquidCursor<Task>> onCreateLoader(int id, Bundle args) {
        Query query = mTaskUtils.getOrderedTasksWithTags();

        SquidCursorLoader<Task> loader = new SquidCursorLoader<Task>(this, TasksDatabase.getInstance(), Task.class,
                query);
        loader.setNotificationUri(HelloSquiDBApplication.CONTENT_URI);
        return loader;
    }

    @Override
    public void onLoaderReset(Loader<SquidCursor<Task>> loader) {
        mTaskListAdapter.swapCursor(null);
    }

    @Override
    public void onLoadFinished(Loader<SquidCursor<Task>> loader, SquidCursor<Task> data) {
        mTaskListAdapter.swapCursor(data);
    }
}
