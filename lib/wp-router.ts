import camelCase from 'camelcase';
import { RouteInterface, RouteList } from './interfaces';

/**
 * DOM-based Routing

 * The routing fires all common scripts, followed by the page specific scripts.
 * Add additional events for more control over timing e.g. a finalize event
 */
export class WpRouter<T extends RouteInterface> {
  private classes: { [key: string]: T };

  /**
   * Create a new Router
   * @param routes
   */
  constructor(private readonly routes: RouteList<T>, private readonly propagate = false) {
    this.classes = {};
  }

  /**
   * Fire Router events
   * @param route     DOM-based route derived from body classes (`<body class="...">`)
   * @param event     Events on the route. By default, `init` and `finalize` events are called.
   * @param propagate Should we trigger a global dispatch event
   */
  public fire(route: string, event: 'init' | 'finalize', propagate: boolean): boolean {
    if (propagate) {
      document.dispatchEvent(
        new CustomEvent('wpRouted', {
          bubbles: true,
          detail: {
            route,
            fn: event,
          },
        }),
      );
    }

    // Route not found - bail out
    if (!this.routes[route]) {
      return false;
    }

    // Class not initialized - load it
    if (!this.classes[route]) {
      this.classes[route] = this.routes[route]();
    }

    try {
      this.classes[route][event]();
    } catch (e) {
      console.error(e);
    }

    return true;
  }

  /**
   * Automatically load and fire Router events
   *
   * Events are fired in the following order:
   *  * common init
   *  * page-specific init
   *  * page-specific finalize
   *  * common finalize
   */
  public loadEvents(): void {
    // Fire common init JS
    this.fire('common', 'init', this.propagate);

    // Fire page-specific init JS, and then finalize JS
    document.body.className
      .toLowerCase()
      .split(/\s+/)
      .map((bodyClass) => camelCase(bodyClass))
      .forEach((className) => {
        this.fire(className, 'init', this.propagate);
        this.fire(className, 'finalize', this.propagate);
      });

    // Fire common finalize JS
    this.fire('common', 'finalize', this.propagate);
  }
}
