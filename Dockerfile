# ------------------- СТАДИЯ 1: СБОРКА REACT -------------------
FROM node:18-alpine AS react-build

WORKDIR /app/react

# Копируем package.json и package-lock.json из вложенной папки
COPY FamilyClub.React/FamilyClub.React/package*.json ./

RUN npm ci && npm cache clean --force

# Копируем весь остальной React-проект
COPY FamilyClub.React/FamilyClub.React/ .

RUN npm run build   # создаст /app/react/dist

# ------------------- СТАДИЯ 2: СБОРКА .NET (используем .NET 10 SDK) -------------------
# Используем preview-образ .NET 10 SDK (поддерживает net10.0)
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-build

WORKDIR /src

# Копируем .csproj файлы
COPY FamilyClub.WebAPI/*.csproj ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/*.csproj ./FamilyClubLibrary/

# Восстанавливаем зависимости
RUN dotnet restore "./FamilyClub.WebAPI/FamilyClub.WebAPI.csproj"

# Копируем все исходники
COPY FamilyClub.WebAPI/ ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/ ./FamilyClubLibrary/

# Публикуем WebAPI
RUN dotnet publish "./FamilyClub.WebAPI/FamilyClub.WebAPI.csproj" -c Release -o /app/publish --no-restore

# ------------------- СТАДИЯ 3: ФИНАЛЬНЫЙ ОБРАЗ (runtime .NET 10) -------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final

WORKDIR /app

COPY --from=dotnet-build /app/publish .
COPY --from=react-build /app/react/dist ./wwwroot

EXPOSE 80
ENTRYPOINT ["dotnet", "FamilyClub.WebAPI.dll"]
