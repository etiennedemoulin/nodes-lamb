# `@ircam/eslint-config`

Shareable eslint config for the Ircam ISMM team JavaScript projects, see [https://eslint.org/docs/latest/developer-guide/shareable-configs](https://eslint.org/docs/latest/developer-guide/shareable-configs)

## Usage


1. Install the package

```sh
npm install --save-dev eslint @ircam/eslint-config
```

2. Create a `.eslintrc` file in your project containing

```
{
  "extends": "@ircam"
}
```

3. In `package.json`, add the following command to your npm script

```json
"scripts": {
  "lint": "eslint src"
}
```

## License

BSD-3-Clause
