FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY images/ /usr/share/nginx/html/images/
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
