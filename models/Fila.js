// importando arquivo de config do banco
const db = require("./db");

// abaixo exemplo que cria a tabela  com os campos descritos
const Fila = db.sequelize.define("filas", {
  senha: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
  },
  guiche: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
  prioridade: {
    type: db.Sequelize.BOOLEAN,
    allowNull: false,
  },
  // A - aguardando - R requisitado - I iniciado - F finalizado - C cancelado
  status: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  atendente: {
    type: db.Sequelize.INTEGER,
    allowNull: true,
  },
});

// comando sync realiza a criação da tabela
Fila.sync({ force: false });

module.exports = Fila;
