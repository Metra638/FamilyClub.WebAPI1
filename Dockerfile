# Multi-stage Dockerfile для сборки и запуска full-stack приложения:
# - React фронтенд (FamilyClub.React)
# - .NET WebAPI бэкенд (FamilyClub.WebAPI) с библиотекой классов (FamilyClubLibrary)
# Всё помещается в один образ, где бэкенд раздаёт статические файлы React.

# ------------------- СТАДИЯ 1: СБОРКА REACT -------------------
FROM node:18-alpine AS react-build

# Рабочая директория для React-проекта
WORKDIR /app/react

# Копируем файлы React-приложения
COPY FamilyClub.React/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Копируем остальные исходники и собираем production-сборку
COPY FamilyClub.React/ .
RUN npm run build

# ------------------- СТАДИЯ 2: СБОРКА .NET -------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build

# Рабочая директория для всего решения
WORKDIR /src

# Копируем файлы решения и проектов
COPY FamilyClub.WebAPI.slnx .
COPY FamilyClub.WebAPI/*.csproj ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/*.csproj ./FamilyClubLibrary/
# Если есть другие проекты, добавьте их аналогично

# Восстанавливаем зависимости
RUN dotnet restore "FamilyClub.WebAPI.slnx"

# Копируем все исходники
COPY FamilyClub.WebAPI/ ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/ ./FamilyClubLibrary/

# Публикуем WebAPI (Release, самодостаточный или зависимый от runtime)
WORKDIR /src/FamilyClub.WebAPI
RUN dotnet publish "FamilyClub.WebAPI.csproj" -c Release -o /app/publish --no-restore

# ------------------- СТАДИЯ 3: ФИНАЛЬНЫЙ ОБРАЗ -------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем опубликованный бэкенд из предыдущей стадии
COPY --from=dotnet-build /app/publish .

# Копируем собранный React-фронтенд в папку wwwroot (стандартное место для статики в ASP.NET Core)
# Если ваш WebAPI настроен на раздачу статики из другого места, измените путь.
COPY --from=react-build /app/react/build ./wwwroot

# Открываем порт (обычно 80 для HTTP, можно перенастроить через ASPNETCORE_URLS)
EXPOSE 80

# Запускаем приложение
ENTRYPOINT ["dotnet", "FamilyClub.WebAPI.dll"]
