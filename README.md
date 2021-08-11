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

Primeiramente, esta biblioteca não tem como objetivo substituir os métodos `setItem`, `getItem` e `removeItem` dos *storages* padrões, ela utiliza destes para armazenar e organizar **médios volumes de dados** que precisem ser colocados em *cache* com um **alto nível de organização**, servindo como um banco de dados com **limite de 10MB\* de armazenamento**.  
Atua *client side*, ou seja, não possui requisição dos dados em um servidor externo, ganhando velocidade em troca de uma menor capacidade de armazenamento, **recomenda-se apenas para dados pouco ou não flutuantes**, ou caso não haja um *server side* para armazenar as informações.  
<sub>\**Valores referentes ao Chrome v92.0.4515.131 64bits, confirme o armazenamento limite para o navegador de sua preferência.*</sub>

## Primeiros Passos

### Importando o Código

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

Ao inicializar a página, o módulo `core.js` se responsabilizará por importar os módulos restantes e carregar a biblioteca, ela por padrão inicializa somente o armazenamento local, se este não iniciar corretamente ou seja necessário recarregar o armazenamento da sessão é possível chamar a função `localJSDataLoad("local")` ou `localJSDataLoad("session")`.  
> Qualquer argumento não reconhecido pela biblioteca que seja passado como parâmetro para `localJSDataLoad` resultará apenas na atualização do *storage* local.

### Definindo Variáveis

Para dar início ao armazenamento em *cache* é necessário criar um *database* e uma estrutura de tabelas.

```js
mydatabase = localDataServer("<db_name>");
mydatabase.createTable("<table_name>", {'<column_name>':'<format>','<column_name>':'<format>'});
```

| formato | definição |
| ------- | --------- |
| text    | Texto simples do tipo **String** |
| number  | Valores numéricos inteiros ou flutuantes do tipo **Number** |
| boolean | Valor binário do tipo **Boolean** |
| date    | Objeto de *datetime* do tipo **Date** |

> O formato das colunas deve ser passado como uma string, somente os formatos descritos acima são aceitos.

### Armazenamento e Busca de Dados

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
    {id: 3, name:   "ana"}]
```

O armazenamento segue uma estrutura semelhante a SQL, ou seja, todos os dados registrados no *cache* pela biblioteca podem ser relacionados, e estas relações podem ser utilizadas para a requisição dos dados.

```js
// define database
mydatabase = localDataServer("database");
mydatabase.createTable("user", {'id':'number','name':'text'});
mydatabase.createTable("message", {'user_id':'number','text':'text'});
>> instance LocalDBJSTableClass

// insert values
mydatabase.insertInto("user", [[1, "maria"], [2,"ethan"], [3, "ana"]]);
>> true
mydatabase.insertInto("message", [[1, "Hello World!"], [1, "Hi"], [3,"Welcome"]]);
>> true

// query values
query = mydatabase.select(["user.name","message.text"])
                  .from(["user", "message"])
                  .where("user.id = message.user_id");

// get result
result = query.fetch();
console.log(result);
>> [{name: "maria", text: "Hello World!"},
    {name: "maria", text:           "Hi"},
    {name:   "ana", text:      "Welcome"}]
```

## Visualização do Banco

### Modelo de Visualizador

O módulo `viewer.js` foi criado especificamente para carregar as tabelas de visualização, se não houver uma página que necessite destes atributos ele pode ser livremente retirado das importações no `core.js`, seu propósito padrão é para facilitar o *debug* dos *caches* criados pela biblioteca.  
Neste mesmo repositório você pode encontrar um arquivo [index.html](https://github.com/YuriShimoi/LocalJSDataServer/blob/main/index.html), que também pode ser acessado online [aqui](https://yurishimoi.github.io/LocalJSDataServer/), nele estão tabelas com atributos específicos que servem unicamente para carregar a visualização dos dados e das estruturas registradas no *cache*.

- `localjsdata-server="local"`: *Databases* registrados no *storage* local;
- `localjsdata-server="session"`: *Databases* registrados no *storage* da sessão;
- `localjsdata-database="<database>"`: Tabelas registradas no *database*.
- `localjsdata-describe="<database>.<table>"`: Estrutura de colunas da tabela.
- `localjsdata-table="<database>.<table>"`: Dados da tabela.

> Para manualmente atualizar as tabelas caso os atributos sejam atualizados ou as tabelas carregadas posteriormente à inicialização do módulo basta chamar a função `localJSDataViewerRun()`.

## Documentação Geral

### localDataServer(databasename, inSession=false)
Cria ou retorna a instância do *database* com o nome especificado.
- Argumentos:
    - `databasename` *String* - Nome do *database*, se o nome já tiver sido definido no *cache* então o já existente será enviado no retorno.
    - `inSession` *Boolean* - Por padrão é `false` e os dados guardados neste *database* serão armazenados no *cache* local, se `true` eles serão armazenados no *cache* da sessão, uma vez criado o *database* ele não pode trocar o tipo de *cache*.
- Retorno:
    - `LocalDBJSDatabaseClass` - Instância do *database*.

### LocalDBJSDatabaseClass.table
Armazena a instância das tabelas.
- Retorno:
    - `[LocalDBJSTableClass]` *Array* - Lista da instância das tabelas registradas no *database*.

### LocalDBJSDatabaseClass.alterTable(tname)
Redireciona para o método `alter()` da tabela especificada.
- Argumentos:
    - `tname` *String* - Nome da tabela.
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.createTable(tname, obj)
- Argumentos:
    - `tname` *String* - 
    - `obj` - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.drop()
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.dropTable(tname)
- Argumentos:
    - `tname` *String* - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.export()
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.import(localDBJSDataJSON)
- Argumentos:
    - `localDBJSDataJSON` - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.insertInto(tname, vals, cols=null)
- Argumentos:
    - `tname` *String* - 
    - `vals` - 
    - `cols` - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.saveState()
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.select(cols=null)
- Argumentos:
    - `cols` - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.setAutoSave(autoSaveStat)
- Argumentos:
    - `autoSaveStat` - 
- Retorno:
    - `` - 

### LocalDBJSDatabaseClass.tables()
- Retorno:
    - `` - 
