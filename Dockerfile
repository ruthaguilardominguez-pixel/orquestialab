FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY images/ /usr/share/nginx/html/images/
COPY coninte/ /usr/share/nginx/html/coninte/
COPY tec/ /usr/share/nginx/html/tec/
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
