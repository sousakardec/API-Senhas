const express = require("express");

const app = express();

const cors = require("cors");

// Enable CORS for all routes, allowing requests from your React app's origin
//habilitando requisições React da mesma maquina, localhost
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your React app's actual origin
  })
);

// importando BodyParser
const bodyParser = require("body-parser");
const { where } = require("sequelize");

// importando biblioteca de data e hora
const moment = require("moment");

// configurando bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importando o sequelize na const Op para auxiliar nas operações de Where
const { Op } = require("sequelize");

// importando models
const Atendente = require("./models/Atendentes");
const Fila = require("./models/Fila");
const Guiche = require("./models/Guiche");

// Rotas
app.get("/", function (req, res) {
  res.send("Home");
});

// ROTAS ATENDENTES

// create
app.post("/atendente/create", function (req, res) {
  Atendente.create({
    nome: req.body.nome,
    email: req.body.email,
    senha: req.body.senha,
    ativo: req.body.ativo,
  })
    .then(function () {
      res.send("Atendente cadastrado com sucesso");
    })
    .catch(function (erro) {
      res.send("erro no cadastro do atendente " + erro);
    });
});

// read
app.get("/atendentes", function (req, res) {
  Atendente.findAll()
    .then(function (atendentes) {
      res.send(atendentes);
    })
    .catch(function (erro) {
      res.send("erro ao listar atendentes " + erro);
    });
});

/// ROTAS GUICHES

// read
app.get("/guiches", function (req, res) {
  Guiche.findAll()
    .then(function (guiches) {
      res.send(guiches);
    })
    .catch(function (erro) {
      res.send("erro ao listar guiches " + erro);
    });
});

//----------------------------------------------------------------------------------

//ROTAS FILAS

// create senha na fila
app.post("/fila/create", function (req, res) {
  let ultimo_senha_gerada = 0;

  const startDate = new Date(moment().format("YYYY-MM-DD") + " 00:00:00"); // 3. Defina a data/hora inicial
  const endDate = new Date(moment().format("YYYY-MM-DD") + " 23:59:59"); // 4. Defina a data/hora final

  // consulta fila com base nos filtros
  Fila.findAll({
    where: {
      status: { [Op.in]: ["A", "R", "I", "F", "C"] },
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["id", "DESC"]],
  })
    .then(function (filas) {
      // valida se é a primeira senha da tabela
      if (filas.length > 0) {
        ultimo_senha_gerada = filas[0].senha;
      }

      //res.send(ultimo_senha);

      Fila.create({
        senha: ultimo_senha_gerada + 1,
        prioridade: req.body.prioridade,
        status: req.body.status,
      })
        .then(function () {
          res.send("senha da fila cadastrada com sucesso");
        })
        .catch(function (erro) {
          res.send("erro no cadastro do senha " + erro);
        });
    })
    .catch(function (erro) {
      res.send("erro ao listar atendentes " + erro);
    });
});

// update
// chama proxima senha
app.post("/fila/update/requisitar", function (req, res) {
  const startDate = new Date(moment().format("YYYY-MM-DD") + " 00:00:00"); // 3. Defina a data/hora inicial
  const endDate = new Date(moment().format("YYYY-MM-DD") + " 23:59:59"); // 4. Defina a data/hora final

  var Fila_id = 0;
  var senhaObject = null;

  // consulta fila com base nos filtros
  Fila.findAll({
    where: {
      status: { [Op.in]: ["A"] },
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["id", "ASC"]],
  })
    .then(function (filas) {
      // valida se é a primeira senha da tabela
      if (filas.length > 0) {
        Fila_id = filas[0].id;
        Fila.update(
          {
            guiche: req.body.guiche,
            atendente: req.body.atendente,
            status: req.body.status,
          },
          {
            where: { id: filas[0].id },
          }
        )
          .then(function () {
            // segunda consulta
            Fila.findAll({
              where: { id: Fila_id },
            })
              .then(function (filasSegundaConsulta) {
                senhaObject = filasSegundaConsulta[0];
                res.send({
                  retorno: "sucesso",
                  msg: "requisição de senha realizada com sucesso",
                  id_fila: Fila_id,
                  senha: senhaObject,
                  guiche_fila: senhaObject.guiche,
                });
              })
              .catch(function (erro) {
                res.send({
                  retorno: "falha",
                  msg: erro,
                });
              });
          })
          .catch(function (erro) {
            res.send("erro ao atualizar senha da fila " + erro);
          });

        // caso não tenha mais senha para chamar
      } else {
        res.send({
          retorno: "sucesso",
          msg: "Fila sem senhas para chamar",
          id_fila: 0,
        });
      }
    })
    .catch(function (erro) {
      res.send("erro ao listar atendentes " + erro);
    });
});

// update
// inicia atendimento senha
app.patch("/fila/update/inicia", function (req, res) {
  var senha = null;

  Fila.findAll({
    where: { id: req.body.id },
  })
    .then(function (filas) {
      senha = filas[0];
    })
    .catch(function (erro) {
      res.send({
        retorno: "falha",
        msg: erro,
      });
    });

  Fila.update(
    {
      status: req.body.status,
    },
    {
      where: { id: req.body.id },
    }
  )
    .then(function () {
      res.send({
        retorno: "sucesso",
        msg: "iniciado atendimento da senha",
        id_fila: req.body.id,
      });
    })
    .catch(function (erro) {
      res.send({
        retorno: "falha",
        msg: erro,
      });
    });
});

// update
// finaliza atendimento senha
app.patch("/fila/update/finaliza", function (req, res) {
  let senha;

  // consulta a senha na fila para retornar os dados
  Fila.findAll({
    where: { id: req.body.id },
  })
    .then(function (filas) {
      senha = filas[0];
    })
    .catch(function (erro) {
      res.send({
        retorno: "falha",
        msg: erro,
      });
    });

  Fila.update(
    {
      status: req.body.status,
    },
    {
      where: { id: req.body.id },
    }
  )
    .then(function () {
      res.send({
        retorno: "sucesso",
        msg: "finalizado atendimento da senha",
        id_fila: req.body.id,
        senha: senha,
      });
    })
    .catch(function (erro) {
      res.send({
        retorno: "falha",
        msg: erro,
      });
    });
});

// read fila
app.get("/fila", function (req, res) {
  Fila.findAll({
    order: [["id", "DESC"]],
  })
    .then(function (fila) {
      res.send(fila);
    })
    .catch(function (erro) {
      res.send("erro ao listar fila " + erro);
    });
});

// read senha destinada ao guiche/usuario
app.get("/fila/consultasenha/:guiche/:atendente", function (req, res) {
  const startDate = new Date(moment().format("YYYY-MM-DD") + " 00:00:00"); // 3. Defina a data/hora inicial
  const endDate = new Date(moment().format("YYYY-MM-DD") + " 23:59:59"); // 4. Defina a data/hora final

  Fila.findOne({
    where: {
      guiche: req.params.guiche,
      atendente: req.params.atendente,
      status: { [Op.in]: ["R", "I"] },
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["id", "DESC"]],
  })
    .then(function (senha) {
      res.send({
        retorno: "sucesso",
        msg: "consulta de senha realizada com sucesso",
        id_fila: senha.id,
        senha: senha,
      });
    })
    .catch(function (erro) {
      res.send("erro ao listar atendentes " + erro);
    });
});

//---------------------------------------------------------------------------------------

app.listen(8081, function () {
  console.log("server run ... port 8081");
});
