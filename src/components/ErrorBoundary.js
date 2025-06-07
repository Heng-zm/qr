import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("QR Code Generation Error:", error, errorInfo);
  }
  
  // Reset the error state when the key changes, allowing a re-render attempt
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
        if (this.state.hasError) {
            this.setState({ hasError: false });
        }
    }
  }

  render() {
    if (this.state.hasError) {
      // Render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;