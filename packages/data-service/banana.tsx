import { Observable } from "rxjs";
import * as React from "react";

const logger = (s: string) => {
  const obs: Observable<string> = Observable.of(s).merge(Observable.of("ya"));
  obs.subscribe(console.log);
};

console.log("with bananas");

export interface IBadgeProps {
  appearance: string;
  children: React.ReactNode | string;
}

class Badge extends React.PureComponent<IBadgeProps, {}> {
  public static defaultProps: Partial<IBadgeProps> = {
    appearance: "default"
  };

  public render() {
    const { appearance, children } = this.props;

    return <span className={appearance}>Aaaaaaah!{children}</span>;
  }
}

export { logger, Badge };
