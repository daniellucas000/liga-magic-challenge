<?php

namespace App;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, array $handler, bool $auth = false): void
    {
        $this->routes[] = compact('method', 'path', 'handler', 'auth');
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method || $route['path'] !== $path) {
                continue;
            }

            if ($route['auth']) {
                Http::requireAuth();
            }

            [$controllerClass, $action] = $route['handler'];
            (new $controllerClass())->$action();
            return;
        }

        Http::json(['error' => 'Route not found.'], 404);
    }
}
