-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "content" TEXT,
    "mediaIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_id_idx" ON "Post"("id");
