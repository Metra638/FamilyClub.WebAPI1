using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyClub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryAndContactFieldsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "branch",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "branch_ref",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city_ref",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "comment",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "delivery_cost",
                table: "orders",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "delivery_provider",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "delivery_type",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "first_name",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "last_name",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "orders",
                type: "text",
                nullable: true);

           
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "branch",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "branch_ref",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "city",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "city_ref",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "comment",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_cost",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_provider",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_type",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "email",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "first_name",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "last_name",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "orders");
        }
    }
}
