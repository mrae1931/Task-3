import { Server, Socket } from 'socket.io';
import Document from '../models/Document';
import { OTService } from '../services/otService';

interface Operation {
  type: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
  version: number;
}

export class SocketController {
  private io: Server;
  private activeDocuments: Map<string, Operation[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  public initialize(): void {
    this.io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);

      socket.on('join-document', async (docId: string) => {
        socket.join(docId);
        
        let document = await Document.findById(docId);
        if (!document) {
          document = await Document.create({ _id: docId });
        }

        // Add user to document
        if (!document.users.includes(socket.id)) {
          document.users.push(socket.id);
          await document.save();
        }

        // Send current state to user
        socket.emit('document-update', {
          content: document.content,
          version: document.version
        });

        // Notify all users in room
        this.io.to(docId).emit('users-update', document.users);
      });

      socket.on('operation', async ({ docId, operation }: { docId: string, operation: Operation }) => {
        const document = await Document.findById(docId);
        if (!document) return;

        // Transform operation against pending operations
        let transformedOp = operation;
        const pendingOps = this.activeDocuments.get(docId) || [];
        
        for (const pendingOp of pendingOps) {
          transformedOp = OTService.transform(transformedOp, pendingOp);
        }

        // Apply operation
        document.content = OTService.applyOperation(document.content, transformedOp);
        document.version += 1;
        await document.save();

        // Store operation temporarily for transformation
        this.activeDocuments.set(docId, [...pendingOps, transformedOp]);

        // Broadcast to other users
        socket.to(docId).emit('operation', {
          operation: transformedOp,
          version: document.version
        });

        // Clear after short delay
        setTimeout(() => {
          const ops = this.activeDocuments.get(docId) || [];
          this.activeDocuments.set(docId, ops.filter(op => op !== transformedOp));
        }, 1000);
      });

      socket.on('disconnect', async () => {
        console.log(`Disconnected: ${socket.id}`);
        // Remove user from all documents
        await Document.updateMany(
          { users: socket.id },
          { $pull: { users: socket.id } }
        );
      });
    });
  }
}
