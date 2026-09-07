# textX Playground

This project represents a playground for textX language. Users can define a new language by specifying its grammar using textX. They can also create a program that should follow the grammar of the defined language.

Some parts of the code are taken from the following projects:
- [textX-LS](https://github.com/textX/textX-LS) - textX server implementation with pygls
- [textx-gen-coloring](https://github.com/textX/textx-gen-coloring) - grammar parser for syntax highlighting
- [monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - language client creation with language server running in web worker

The project is deployed and you can create and validate your new language using textX at [textx.github.io/textx-playground](https://textx.github.io/textx-playground).

## Functionalities

This is a web application with only one page, containing a header and two code editors. 

One editor is used for specifying language grammar and the second for defining a model (program) using newly defined language. Each editor contains the status bar, which has one of the following states:
- loading - until textX server is started
- error - shows error in grammar/model with message and position (row, column)
- valid - grammar/model is valid

The header contains textX logo, toggler between light and dark theme, and links to documentation and GitHub repository.

Grammar and model content can be shared via link by clicking the share icon in the top right corner. Their content is shortened using LZ compression and embedded into the URL link as a query parameter. When this link is opened, the editors' content is restored from the query parameter.

Basic syntax highlighting is implemented. Grammar and model keywords and comments are highlighted.

Code suggestions appear while typing, or explicitly with **Ctrl+Space**. The grammar
editor suggests textX syntax, built-in types, and locally declared rule names. The
model editor suggests literal tokens from the current valid grammar. Suggestions
prefer the parser's expected syntax at the cursor; when an earlier error or a
permissive regex prevents this, items marked **Grammar vocabulary** provide general
suggestions filtered by the typed prefix. Accepting a word replaces its current token.

An invalid or empty grammar temporarily disables model suggestions. Completion does
not resolve model-object references, imported files, or arbitrary regex values, and
does not provide snippets. Parser probing is best-effort rather than full error
recovery. Automatic suggestions are disabled inside tokenized comments and strings;
Ctrl+Space can still request them explicitly.

## Development

After cloning the repo and installing dependencies with `npm i` command, the project is started by running:

```
npm run dev -- --port 3000
```

The project is built with:

```
npm run build
```

Completion regression tests use the same textX and pygls versions as the worker:

```sh
python -m pip install -r tests/requirements.txt
python -m unittest discover -s tests -v
```
