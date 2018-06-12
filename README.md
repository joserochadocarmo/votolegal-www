# Projeto Voto Legal

## Description

Voto Legal candidate control panel

## Instalação

```
# instala as dependencias
bundle install

# para criar um build do projeto
bundle exec middleman build

# para iniciar o servidor a partir do source
bundle exec middleman server
```

## Modulo

`votoLegal`

## Routes

'.javascipts/app/controler'

### cadastro.js.erb

- `/dados-pessoais`
- `/dados-campanha`
- `/projetos`

### candidate.js.erb

- `/`
- `/doar`
- `/doar/success`
- `/votar/:token`

## Services

- '.javascipts/app/alls.js'
  - `serialize`
  - `postmon`
  - `unsafe`
  - `trouble`
  - `auth_service`

## Controllers

- `MenuController`

## Informações estratégicas

The build needs to be manually triggered and the compiled files commited.
