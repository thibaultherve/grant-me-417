-- CreateTable user_favorite_postcodes
CREATE TABLE "user_favorite_postcodes" (
    "user_id" UUID NOT NULL,
    "postcode" VARCHAR(4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_postcodes_pkey" PRIMARY KEY ("user_id","postcode")
);

-- CreateIndex idx_user_favorite_postcodes_user_id
CREATE INDEX "idx_user_favorite_postcodes_user_id" ON "user_favorite_postcodes"("user_id");

-- AddForeignKey for user_id
ALTER TABLE "user_favorite_postcodes" ADD CONSTRAINT "user_favorite_postcodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for postcode
ALTER TABLE "user_favorite_postcodes" ADD CONSTRAINT "user_favorite_postcodes_postcode_fkey" FOREIGN KEY ("postcode") REFERENCES "postcodes"("postcode") ON DELETE CASCADE ON UPDATE CASCADE;
