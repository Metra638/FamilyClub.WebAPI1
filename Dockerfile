# Multi-stage Dockerfile для FamilyClub (React + .NET WebAPI)

# ------------------- СТАДИЯ 1: СБОРКА REACT -------------------
FROM node:18-alpine AS react-build

WORKDIR /app/react

# Копируем package.json и package-lock.json из вложенной папки
COPY FamilyClub.React/FamilyClub.React/package*.json ./

# Устанавливаем зависимости (включая dev, нужные для Vite)
RUN npm ci && npm cache clean --force

# Копируем весь остальной React-проект (из той же вложенной папки)
COPY FamilyClub.React/FamilyClub.React/ .

# Собираем production-сборку (Vite создаст папку dist)
RUN npm run build

# ------------------- СТАДИЯ 2: СБОРКА .NET -------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build

WORKDIR /src

# Копируем файл решения
COPY FamilyClub.WebAPI.slnx .

# Копируем .csproj файлы для восстановления зависимостей
COPY FamilyClub.WebAPI/*.csproj ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/*.csproj ./FamilyClubLibrary/

# Восстанавливаем пакеты
RUN dotnet restore "FamilyClub.WebAPI.slnx"

# Копируем все исходники
COPY FamilyClub.WebAPI/ ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/ ./FamilyClubLibrary/

# Публикуем WebAPI (Release)
WORKDIR /src/FamilyClub.WebAPI
RUN dotnet publish "FamilyClub.WebAPI.csproj" -c Release -o /app/publish --no-restore

# ------------------- СТАДИЯ 3: ФИНАЛЬНЫЙ ОБРАЗ -------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Копируем опубликованный бэкенд
COPY --from=dotnet-build /app/publish .

# Копируем собранный React-фронтенд (Vite по умолчанию создаёт папку dist)
# Если в vite.config.ts указан другой output, замените dist на нужное имя
COPY --from=react-build /app/react/dist ./wwwroot

# Открываем порт (можно переопределить через ASPNETCORE_URLS)
EXPOSE 80

# Запускаем приложение
ENTRYPOINT ["dotnet", "FamilyClub.WebAPI.dll"]
