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

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
          <div className="relative w-full max-w-lg mx-4">
            <img src="/error_pop.png" alt="Error Popover" className="w-full h-auto scale-110" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 top-[12rem]">
              <p className="text-gray-600 text-center text-lg font-mono font-bold p-2 rounded-md">
                {this.state.error?.toString() || "An unexpected error occurred"}
              </p>
              <div
                className="absolute top-[7rem] right-2 w-16 h-14 cursor-pointer"
                onClick={this.resetError}
                style={{ background: "transparent" }}
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}