-- Fix: add onDelete: Cascade to all User foreign keys that lacked it,
-- so deleting a user no longer fails with a foreign key constraint error.

-- ClientInteraction.userId
ALTER TABLE "ClientInteraction" DROP CONSTRAINT "ClientInteraction_userId_fkey";
ALTER TABLE "ClientInteraction" ADD CONSTRAINT "ClientInteraction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Task.assignedTo
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedTo_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedTo_fkey"
  FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Operation.userId
ALTER TABLE "Operation" DROP CONSTRAINT "Operation_userId_fkey";
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ClientChatMessage.userId
ALTER TABLE "ClientChatMessage" DROP CONSTRAINT "ClientChatMessage_userId_fkey";
ALTER TABLE "ClientChatMessage" ADD CONSTRAINT "ClientChatMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
