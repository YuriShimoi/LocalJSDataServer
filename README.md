# LocalJSDataServer

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://github.com/YuriShimoi/LocalJSDataServer/blob/master/LICENSE)

- [English documentation](#en-us)
- [Documentação em português](#pt-br)

# en-US

## What?



## Why?



## First Steps



---

# pt-BR

## O quê?

Esta é uma ferramenta (MVP) com estrutura baseada em SQL, o propósita desta é facilitar a manipulação e o armazenamento de dados entre páginas de um mesmo domínio.

## Por quê?

Primeiramente, esta ferramenta não tem como objetivo substituir os métodos `setItem`, `getItem` e `removeItem` dos *storages* padrões, ela utiliza destes para armazenar e organizar **médios volumes de dados** que precisem ser colocados em *cache* com um **alto nível de organização**, servindo como um banco de dados com **limite de 10MB\* de armazenamento**.  
Atua *client side*, ou seja, não possui requisição dos dados em um servidor externo, ganhando velocidade em troca de uma menor capacidade de armazenamento, **recomenda-se apenas para dados pouco ou não flutuantes**, ou caso não haja um *server side* para armazenar as informações.  
<sub>\**Valores referentes ao Chrome v92.0.4515.131 64bits, confirme o armazenamento limite para o navegador de sua preferência.*</sub>

## Primeiros Passos

#### Importando o Código

Considerando uma estrutura semelhante:

```markdown
├── index.html
├── ...
└── import/
    ├── ...
    └── localJSDataServer/
        ├── core.js
        └── ...
```

Dentro de `index.html` é necessário somente a importação do arquivo `core.js`.

```html
<script src="import/localJSDataServer/core.js"></script>
```

**Não altere o nome da pasta** `localJSDataServer`, caso esta tenha seu nome alterado, é necessário colocar o novo nome no arquivo `core.js` para que ele realize corretamente a importação do restante dos módulos.

```markdown
core.js
├── var FOLDERNAME = "localJSDataServer";
└── ...
```

#### Definindo Variáveis

Para dar início ao armazenamento em *cache* é necessário criar um *database* e uma estrutura de tabelas.

```js
mydatabase = localDataServer("<db_name>");
mydatabase.createTable("<table_name>", {'<column_name>':'<format>','<column_name>':'<format>'});
```

> O formato das colunas deve ser passado como uma string, somente os formatos descritos abaixo são aceitos.

| formato | definição |
| ------- | --------- |
| text    | Texto simples do tipo **String** |
| number  | Valores numéricos inteiros ou flutuantes do tipo **Number** |
| boolean | Valor binário do tipo **Boolean** |
| date    | Objeto de *datetime* do tipo **Date** |

#### Armazenamento e Resgate de Dados

Definida a estrutura, é possível alterá-la futuramente, mas primeiro o básico sobre armazenar e obter os dados posteriormente pode ser feito com os métodos `<database>.insertInto` e `<database>.select().from`.

```js
// define database
mydatabase = localDataServer("database");
mydatabase.createTable("table", {'id':'number','name':'text'});
>> instance LocalDBJSTableClass

// insert values
mydatabase.insertInto("table", [[1, "maria"], [2,"ethan"]]);
>> true
mydatabase.insertInto("table", [3, "ana"]);
>> true

// query values
query = mydatabase.select().from("table");

// get result
result = query.fetch();
console.log(result);
>> [{id: 1, name: "maria"},
    {id: 2, name: "ethan"},
    {id: 3, name: "ana"}]
```
