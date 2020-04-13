> Este repositório faz parte de uma aplicação voltada para a prevenção do COVID-19 através do diagnóstico e rastreamento de possíveis casos positivos.

# COVID - Back-end

Essa aplicação contém os micro e nano-serviços para as seguintes aplicações:

-  [COVID-Diagnóstico](https://github.com/cordeiro2020/covid-diagnostico) 
-  [COVID-Dashboard](https://github.com/cordeiro2020/covid-dashboard) 
-  [COVID-Segurança](https://github.com/cordeiro2020/covid-seguranca) 


## Pré-requisitos :heavy_check_mark:

* [node](https://nodejs.org/en/) - v8.0.0 ou superior
* [yarn](https://yarnpkg.com/pt-BR/) - v1.15 ou superior


## Iniciando :zap:

    git clone https://github.com/cordeiro2020/covid-back.git
    cd covid-back
    yarn install
   
   Para rodar as functions locais utilize a CLI do firebase :gesto_ok::
    
    firebase serve --only functions

## Build :hammer:
    yarn build

## Deployment :rocket:

    Usamos o deploy com CI/CD  configurado no arquivo `.gitlab-ci.yml` mas você pode usar qualquer CI/CD que quiser, ou fazer deploy usando o firebase-CLI.

## Feito com :package:

* [firebase](https://www.npmjs.com/package/firebase) - Realtime Database / Notifications
* [moment](https://github.com/moment/moment/) - Manipulação de data e hora

## Quem participou? :busts_in_silhouette:

:construction:
