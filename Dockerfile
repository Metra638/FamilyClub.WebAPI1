# Multi-stage Dockerfile для сборки и запуска full-stack приложения:
# - React фронтенд (FamilyClub.React)
# - .NET WebAPI бэкенд (FamilyClub.WebAPI) с библиотекой классов (FamilyClubLibrary)

# ------------------- СТАДИЯ 1: СБОРКА REACT -------------------
FROM node:18-alpine AS react-build

WORKDIR /app/react

# Копируем package.json и package-lock.json (если есть)
COPY FamilyClub.React/package*.json ./

# Устанавливаем все зависимости (включая dev, нужные для сборки)
RUN npm install && npm cache clean --force

# Копируем остальные исходники React-приложения
COPY FamilyClub.React/ .

# Собираем production-сборку
RUN npm run build

# ------------------- СТАДИЯ 2: СБОРКА .NET -------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build

WORKDIR /src

# Копируем файлы решения и проектов для восстановления зависимостей
COPY FamilyClub.WebAPI.slnx .
COPY FamilyClub.WebAPI/*.csproj ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/*.csproj ./FamilyClubLibrary/

RUN dotnet restore "FamilyClub.WebAPI.slnx"

# Копируем все исходники
COPY FamilyClub.WebAPI/ ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/ ./FamilyClubLibrary/

# Публикуем WebAPI
WORKDIR /src/FamilyClub.WebAPI
RUN dotnet publish "FamilyClub.WebAPI.csproj" -c Release -o /app/publish --no-restore

# ------------------- СТАДИЯ 3: ФИНАЛЬНЫЙ ОБРАЗ -------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Копируем опубликованный бэкенд
COPY --from=dotnet-build /app/publish .

# Копируем собранный React-фронтенд в папку wwwroot (статический контент)
COPY --from=react-build /app/react/build ./wwwroot

EXPOSE 80

ENTRYPOINT ["dotnet", "FamilyClub.WebAPI.dll"]
