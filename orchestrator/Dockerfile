# Imagen base
FROM node:20

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código
COPY . .

# Exponer el puerto
EXPOSE 6000

# Comando por defecto
CMD ["node", "index.js"]
