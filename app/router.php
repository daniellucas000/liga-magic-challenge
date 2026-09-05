<?php

namespace App;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, array $handler, bool $auth = false, ?array $roles = null): void
    {
        $this->routes[] = compact('method', 'path', 'handler', 'auth', 'roles');
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $params = $this->match($route['path'], $path);
            if ($params === null) {
                continue;
            }

            if ($route['auth']) {
                Http::requireAuth();
            }

            if ($route['roles'] !== null) {
                Http::requireRole($route['roles']);
            }

            [$controllerClass, $action] = $route['handler'];
            (new $controllerClass())->$action(...array_values($params));
            return;
        }

        Http::json(['error' => 'Route not found.'], 404);
    }

    private function match(string $routePath, string $requestPath): ?array
    {
        $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';

        if (!preg_match($pattern, $requestPath, $matches)) {
            return null;
        }

        array_shift($matches);
        return $matches;
    }
}
