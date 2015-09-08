# Email Gulp Boilerplate

A quick and easy slack to create emails using dev tools and good practices

## Tools

* Gulp
* Twig
* SASS / BEM
* Yaml
* JSON
* iCal
* Premailer
* Dploy

## Install & Use

1. `npm install`
2. Set config in `yaml/config.yml`
3. Set emails variables in `json/pages.json`
4. Make your email in `twig/email.twig`
5. `gulp dev` to watch and build
6. `gulp dist` to inline css

## Images & expires

Images are optimized and placed in `build/img` only. `gulp dist` will only inline css into your HTML. 

Feel free to edit `build/.htaccess` to fit your needs regarding assets expirations.
