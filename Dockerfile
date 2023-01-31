FROM public.ecr.aws/lambda/nodejs:16

COPY index.js package.json package-lock.json ./

RUN npm ci --omit=dev

CMD ["index.handler"]