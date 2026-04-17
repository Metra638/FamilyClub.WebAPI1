# ------------------- СТАДИЯ 1: СБОРКА REACT -------------------
FROM node:22-bookworm-slim AS react-build

WORKDIR /app/react

COPY FamilyClub.React/FamilyClub.React/package*.json ./
RUN npm ci && npm cache clean --force

COPY FamilyClub.React/FamilyClub.React/ .

RUN npm install custom-event-polyfill --save-dev && \
    echo "import 'custom-event-polyfill';" >> src/main.tsx

RUN npm run build

# ------------------- СТАДИЯ 2: СБОРКА .NET -------------------
FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0-preview AS dotnet-build

WORKDIR /src

COPY FamilyClub.WebAPI/*.csproj ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/*.csproj ./FamilyClubLibrary/

RUN dotnet restore "./FamilyClub.WebAPI/FamilyClub.WebAPI.csproj"

COPY FamilyClub.WebAPI/ ./FamilyClub.WebAPI/
COPY FamilyClubLibrary/ ./FamilyClubLibrary/

RUN dotnet publish "./FamilyClub.WebAPI/FamilyClub.WebAPI.csproj" -c Release -o /app/publish --no-restore

# ------------------- СТАДИЯ 3: ФИНАЛЬНЫЙ ОБРАЗ -------------------
FROM mcr.microsoft.com/dotnet/nightly/aspnet:10.0-preview AS final

WORKDIR /app

COPY --from=dotnet-build /app/publish .
COPY --from=react-build /app/react/dist ./wwwroot

EXPOSE 80
ENTRYPOINT ["dotnet", "FamilyClub.WebAPI.dll"]
