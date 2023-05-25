FROM mhart/alpine-node
RUN yarn config set strict-ssl false

WORKDIR /opt/backend
COPY . .

# RUN yarn install
# RUN yarn build

# COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["yarn", "start"]