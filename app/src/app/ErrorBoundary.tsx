'use client'

import React, { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-[300px] h-[180px] bg-no-repeat bg-contain bg-center" style={{ backgroundImage: "url('/error_popover.png')" }}>
          <div className="absolute top-6 w-full text-center px-4 text-white text-lg font-semibold drop-shadow-md">
            Oops! Something went wrong.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
