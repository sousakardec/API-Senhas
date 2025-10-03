# definindo aplicação e versão - alpine: versão mais exuta do node 
FROM node:22.20.0-alpine3.22

# diretorio onde aplicação vai rodar no conteiner criado.
WORKDIR  /usr/app

# update e instalação de todas as dependencias
RUN apk update && apk upgrade
RUN apk add git
RUN apk add bash

# comando para copiar todos os arquivos que começão com: packge e termina com json
COPY package*.json ./

# roda comando de instalação de dependencias
RUN npm install

# comando que copia todos os demais arquivos do projeto
COPY . .

# definindo porta que o servidor vai expor
EXPOSE 3000

# comando unico usado para da star do servidor (!! SOMENTE UM PODE ARQUIVO DOCKERFILE)
CMD ["npm", "start"]


