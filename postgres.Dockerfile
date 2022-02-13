FROM postgres:11

ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD postgres
ENV DB_USER sardineadmin
ENV DB_NAME sardinedb
ENV DB_PASSWORD Yn(Y)Q7mWZC4}>qC

ADD deployments/db-init/ /docker-entrypoint-initdb.d
ADD pgsql/ pgsql/
