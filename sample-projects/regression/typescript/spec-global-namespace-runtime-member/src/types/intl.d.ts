declare global {
  namespace Intl {
    class DurationFormat {
      format(duration: object): string;
    }
  }
}

export {};
