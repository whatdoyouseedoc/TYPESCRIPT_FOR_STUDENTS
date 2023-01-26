type HTTP_STATUS = 200 | 500;
type HTTP_METHOD = 'GET' | 'POST';

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

interface HttpRequest {
  method: HTTP_METHOD;
  host: string;
  path: string;
  params: {
    [key: string]: string;
  };
  body?: {
    [key: string]: any;
  };
}

interface IObserver {
  next: (value: HttpRequest) => void;
  error: (error: HttpRequest) => void;
  complete: () => void;
  unsubscribe: () => void;
}

interface IObservable {
  subscribe: (obs: Handlers) => { unsubscribe: () => void };
}

interface Handlers {
  next: (request: HttpRequest) => HTTP_STATUS;
  error: (error: HttpRequest) => HTTP_STATUS;
  complete: () => void;
}

class Observer implements IObserver {
  public _unsubscribe?: () => void;

  constructor(private handlers: Handlers, private isUnsubscribed = false) {}

  next(value: HttpRequest) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: HttpRequest) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable implements IObservable {
  constructor(private _subscribe: any) {}

  static from(values: HttpRequest[]) {
    return new Observable((observer: Observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: Handlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}
