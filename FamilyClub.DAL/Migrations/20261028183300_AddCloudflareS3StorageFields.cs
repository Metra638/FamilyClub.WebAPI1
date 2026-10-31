using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyClub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddCloudflareS3StorageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "image_data",
                table: "product_image",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "product_image",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "storage_key",
                table: "product_image",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "image_data",
                table: "complaint_images",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "complaint_images",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "storage_key",
                table: "complaint_images",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "avatar_storage_key",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "avatar_url",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_url",
                table: "product_image");

            migrationBuilder.DropColumn(
                name: "storage_key",
                table: "product_image");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "complaint_images");

            migrationBuilder.DropColumn(
                name: "storage_key",
                table: "complaint_images");

            migrationBuilder.DropColumn(
                name: "avatar_storage_key",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "avatar_url",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<byte[]>(
                name: "image_data",
                table: "product_image",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "image_data",
                table: "complaint_images",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);
        }
    }
}
