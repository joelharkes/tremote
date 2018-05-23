
import * as React from "react";

export interface WidgetProps {
    model: object;
    onChange(model: Partial<object>);
    onRemove();
}

export interface WidgetPropsTyped<T extends object> extends WidgetProps {
    model: T;
    onChange(model: Partial<T>);
}

/** 
 * Dashboard widget base 
 */
export abstract class WidgetComponent<TPropModel extends object, TState> extends React.Component<WidgetPropsTyped<TPropModel>, TState> {
}

export interface WidgetComponentConstructor extends React.ClassType<WidgetPropsTyped<any>, WidgetComponent<any, React.ComponentState>, any> { }

export interface Widget {
    render(props: WidgetProps): JSX.Element;
    createNewModel(): object;
}

export abstract class WidgetBase<TModel extends object> implements Widget {
    // render(props: WidgetProps): React.Component {
    //     return this.renderComponent(props as WidgetPropsTyped<TModel>);
    // }
    abstract render(props: WidgetPropsTyped<TModel>): JSX.Element;
    abstract createNewModel(): TModel;
}

export class WidgetFor<TModel extends object> implements WidgetBase<TModel> {
    private newModelFn: () => TModel;
    private componentClass: WidgetComponentConstructor;
    constructor(reactComponentClass: WidgetComponentConstructor, createNewModelFn: () => TModel) {
        this.componentClass = reactComponentClass;
        this.newModelFn = createNewModelFn;
    }
    render(props: WidgetPropsTyped<TModel>): JSX.Element {
        return React.createElement<any, any, any>(this.componentClass, props);
    }
    createNewModel() {
        return this.newModelFn();
    }
}
