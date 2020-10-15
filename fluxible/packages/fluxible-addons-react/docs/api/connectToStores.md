# connectToStores

```js
import connectToStores from 'fluxible-addons-react/connectToStores';
```

`connectToStores` is a higher-order component that provides a convenient way to access state from the stores from within your component. It takes care of defining `getInitialState` and listening to the stores for updates. The store state will be sent to the `Component` instance as props. It is required that the React context is set and has access to `getStore`. It is recommended to use [`provideContext`](provideContext.md) around your top level component to do this for you.

Takes the following parameters:

 * `Component` - the component that should receive the state as props, optional if using decorator pattern
 * `stores` - array of store constructors to listen for changes
 * `getStateFromStores` - function that receives all stores and should return the full state object. Receives `stores` hash and component `props` as arguments
 * `customContextTypes` (*optional*) - additional `contextTypes` that could be accessed from your `getStateFromStores` function

## Example

The following example will listen to changes in `FooStore` and `BarStore` and pass `foo` and `bar` as props to the `Component` when it is instantiated.

```js
class Component extends React.Component {
    render() {
        return (
            <ul>
                <li>{this.props.foo}</li>
                <li>{this.props.bar}</li>
            </ul>
        );
    }
}

Component = connectToStores(Component, [FooStore, BarStore], (context, props) => ({
    foo: context.getStore(FooStore).getFoo(),
    bar: context.getStore(BarStore).getBar()
}));

export default Component;
```

### Decorator

***Decorators are an evolving proposal and should be used with caution
as the API may change at any point. Decorator support in
fluxible-addons-react was built against Babel 5's implementation of
decorators. As of Babel 6, support for decorators has been removed although
third party transforms have been attempted with limited success.

Decorators are also only proposed for classes and properties and therefore
will not work with stateless functional components. See
[decorator pattern](https://github.com/wycats/javascript-decorators) for
more information on the proposal.***

```js
@connectToStores([FooStore, BarStore], (context, props) => ({
    foo: context.getStore(FooStore).getFoo(),
    bar: context.getStore(BarStore).getBar()
}))
class Component extends React.Component {
    render() {
        return <div/>;
    }
}
export default Component;
```
