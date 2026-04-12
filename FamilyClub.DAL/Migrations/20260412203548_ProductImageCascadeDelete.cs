using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyClub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class ProductImageCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_product_image_products_product_id",
                table: "product_image");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "product_image",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_product_image_products_product_id",
                table: "product_image",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_product_image_products_product_id",
                table: "product_image");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "product_image",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "fk_product_image_products_product_id",
                table: "product_image",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id");
        }
    }
}
