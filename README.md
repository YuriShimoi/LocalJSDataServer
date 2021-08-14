# LocalJSDataServer

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://github.com/YuriShimoi/LocalJSDataServer/blob/master/LICENSE)

- [English documentation](#en-us)
- [Documentação em português](#pt-br)

# en-US

## What?



## Why?



## First Steps



## Data Viewer



## General Documentation

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
mydatabase.createTable("user", {'id':'number','name':'text','age':'number'});
mydatabase.createTable("message", {'user_id':'number','text':'text'});
>> instance LocalDBJSTableClass

// insert values
mydatabase.insertInto("user", [[1, "maria", 20], [2,"ethan", 21], [3, "ana", 22]]);
>> true
mydatabase.insertInto("message", [[1, "Hello"], [2, "Hi"], [2, "Bye"], [3,"Welcome"]]);
>> true

// query values
query = mydatabase.select(["user.name","message.text"])
                  .from(["user", "message"])
                  .where("user.id = message.user_id AND user.age >= 21");

// get result
result = query.fetch();
console.log(result);
>> [{name: "ethan", text:      "Hi"},
    {name: "ethan", text:     "Bye"},
    {name:   "ana", text: "Welcome"}]
```

## Visualização dos Dados

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

### localDataServer

#### localDataServer(databasename, inSession=false)

Cria ou retorna a instância do *database* com o nome especificado.  

- Argumentos:
    - `databasename` *String* - Nome do *database*, se o nome já tiver sido definido no *cache* então o já existente será enviado no retorno;
    - `inSession` *Boolean* - Por padrão é `false` e os dados guardados neste *database* serão armazenados no *cache* local, se `true` eles serão armazenados no *cache* da sessão, uma vez criado o *database* ele não pode trocar o tipo de *cache*.
- Retorno:
    - `LocalDBJSDatabaseClass` - Instância do *database*.

### LocalDBJSDatabaseClass

#### LocalDBJSDatabaseClass.table

Armazena a instância das tabelas.  

- Retorno:
    - `[LocalDBJSTableClass]` - *Array* da instância das tabelas registradas no *database*.

#### LocalDBJSDatabaseClass.alterTable(tname)

> Redireciona para o método `alter()` da tabela especificada. Verifique o retorno na especificação dos [métodos de tabela](#localdbjstableclass).

- Argumentos:
    - `tname` *String* - Nome da tabela.

#### LocalDBJSDatabaseClass.createTable(tname, obj)

Cria uma tabela com o nome e formato especificados.

- Argumentos:
    - `tname` *String* - Nome da tabela;
    - `obj` *Object* - Estrutura da tabela, o objeto deve seguir o formato `{'<column>':'<format>',...}`. Os formatos válidos de coluna estão listados [aqui](#definindo-vari%C3%A1veis).
- Retorno:
    - `LocalDBJSTableClass|Boolean` - Instância da tabela criada, ou `false` caso não seja possível criar.

#### LocalDBJSDatabaseClass.deleteFrom(tname)

> Redireciona para o método `delete()` da tabela especificada. Verifique o retorno na especificação dos [métodos de tabela](#localdbjstableclass).

- Argumentos:
    - `tname` *String* - Nome da tabela.

#### LocalDBJSDatabaseClass.drop()

Apaga todos os dados salvos no *cache* e apaga as instâncias de tabela deste *database*.

#### LocalDBJSDatabaseClass.dropTable(tname)

Apaga a instância da tabela especificada.

- Argumentos:
    - `tname` *String* - Nome da tabela.

#### LocalDBJSDatabaseClass.export()

Exporta o *database* em *JSON* com o formato necessário para o método `import()`.

- Retorno:
    - `String` - *JSON* com os dados das tabelas.

#### LocalDBJSDatabaseClass.import(localDBJSDataJSON)

Importa os dados do *JSON* especificado para esta instância de *database*.

- Argumentos:
    - `localDBJSDataJSON` *String* - *JSON* com o formato retornado pelo método `export()`.

#### LocalDBJSDatabaseClass.insertInto(tname, vals, cols=null)

> Redireciona para o método `insert()` da tabela especificada. Verifique o retorno na especificação dos [métodos de tabela](#localdbjstableclass).

- Argumentos:
    - `tname` *String* - Nome da tabela;
    - `vals` *String|Number|Boolean|Date|Array* - Valores a serem inseridos na tabela, pode ser um valor único caso haja somente uma coluna especificada, uma única *array* com os dados ordenados igualmente à *array* de colunas ou uma *array* destas (E.g. `<value>`, `[<values>]` ou `[[<values>],[<values>]]`);
    - `cols` *String|Array|null* - Por padrão é `null` e busca todas as colunas desta tabela. São as colunas onde os dados serão inseridos, deve ter o formato coerente com o formato dos dados inseridos.
- Retorno:
    - `Boolean` - Se a operação teve sucesso.

#### LocalDBJSDatabaseClass.saveState()

Salva os dados da instância no *cache*.

#### LocalDBJSDatabaseClass.select(cols=null)

Seleciona colunas das estruturas das tabelas e retorna uma `localDBJSQuery` para buscar os dados salvos no *database*.

- Argumentos:
    - `cols` *[String]* - *Array* das colunas que serão retornadas, o formato deve seguir o padrão `"<table>.<column>"`.
- Retorno:
    - `localDBJSQuery` - Instância de *query*, ver mais detalhes nas especificações dos [métodos de query](#localdbjsquery).

#### LocalDBJSDatabaseClass.setAutoSave(autoSaveStat)

Ativa ou desativa o salvamento automático em *cache*.

- Argumentos:
    - `autoSaveStat` *Boolean* - Por padrão é `true` e salva automaticamente no *cache* sempre que uma alteração é feita na instância, seja a criação, alteração ou inserção ou remoção de dados em uma tabela, se `false` o armazenamento em *cache* só é executado quando o método `saveState()` for chamado.

#### LocalDBJSDatabaseClass.tables()

Retorna as tabelas registradas neste *database*.

- Retorno:
    - `[String]` - *Array* com o nome das tabelas.

### LocalDBJSTableClass

#### LocalDBJSTableClass.describe

Formato da tabela.
> Não altere o formato por esta variável a menos que tenha certeza do que está fazendo, a biblioteca opera diretamente neste formato e ele é internamente sincronizados com o *cache*, alterações manuais não possuem garantia de persistência e podem resultar nos dados serem corrompidos ou perdidos no caso de uma alteração manual.

- Retorno:
    - `Object` - Estrutura da tabela, o objeto segue o formato `{'<column>':'<format>',...}`. Os formatos válidos de coluna estão listados [aqui](#definindo-vari%C3%A1veis).

#### LocalDBJSTableClass</dot>.name

Nome da tabela.

- Retorno:
    - `String`

#### LocalDBJSTableClass.values

Valores guardados na tabela.
> Não altere os valores por esta variável a menos que tenha certeza do que está fazendo, a biblioteca opera diretamente nestes valores e eles são internamente sincronizados com o *cache*, alterações manuais não possuem garantia de persistência e podem resultar nos dados serem corrompidos ou perdidos no caso de uma alteração manual.

- Retorno:
    - `[Object]` - *Array* com o valores que seguem o formato da tabela.

#### LocalDBJSTableClass.alter()



- Retorno:
    - `` - 

#### LocalDBJSTableClass.delete()



- Retorno:
    - `` - 

#### LocalDBJSTableClass.insert(vals, cols = null)

Insere valores na tabela.

- Argumentos:
    - `vals` *String|Number|Boolean|Date|Array* - Valores a serem inseridos na tabela, pode ser um valor único caso haja somente uma coluna especificada, uma única *array* com os dados ordenados igualmente à *array* de colunas ou uma *array* destas (E.g. `<value>`, `[<values>]` ou `[[<values>],[<values>]]`);
    - `cols` *String|Array|null* - Por padrão é `null` e busca todas as colunas desta tabela. São as colunas onde os dados serão inseridos, deve ter o formato coerente com o formato dos dados inseridos.
- Retorno:
    - `Boolean` - Se a operação teve sucesso.

#### LocalDBJSTableClass.print()

Desenha uma tabela com os dados no console. utilizando `console.table()`.

### LocalDBJSQuery

#### LocalDBJSQuery.fetch(printAtEnd=false)



- Argumentos:
    - `` ** - 
- Retorno:
    - `` - 

#### LocalDBJSQuery.from(table)



- Argumentos:
    - `` ** - 
- Retorno:
    - `LocalDBJSQuery` - *Query* com a nova configuração.

#### LocalDBJSQuery.where(condition)



- Argumentos:
    - `` ** - 
- Retorno:
    - `LocalDBJSQuery` - *Query* com a nova configuração.