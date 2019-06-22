import * as React from "react";
import * as ReactDOM from "react-dom";

class TestComponent extends React.Component<{}, {}> {
    public render() {
        return <h1>Hi from the component!</h1>;
    }
}

ReactDOM.render(
    <TestComponent />,
    document.getElementById("app-host")
);
