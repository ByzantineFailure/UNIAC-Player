import * as React from "react";
import {connect} from "react-redux";

import {IState} from "../state/reducer";

export interface ILoadingBarProps {
    loading: boolean;
}

const RawLoadingBar: React.FunctionComponent<ILoadingBarProps> = (props: ILoadingBarProps) => (
    !props.loading ? <div></div> :
    <div className="loading-bar">
        <div className="slider"></div>
    </div>
);

const mapStateToProps = (state: IState): ILoadingBarProps => ({
    loading: true, // state.loading,
});

const mapDispatchToProps = (state: IState): {} => ({});

export const LoadingBar = connect(
    mapStateToProps,
    mapDispatchToProps,
)(RawLoadingBar);
