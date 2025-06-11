import { useState, useEffect } from 'react';
import { 
  joinDocument, 
  leaveDocument, 
  sendOperation, 
  onDocumentUpdate, 
  onUsersUpdate 
} from '../services/socket';
import { Operation } from '../models/types';

export const useDocument = (docId: string) => {
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    joinDocument(docId);

    const handleUpdate = (newContent: string) => {
      setContent(newContent);
    };

    const handleUsersUpdate = (newUsers: any) => {
      setUsers(newUsers);
    };

    onDocumentUpdate(handleUpdate);
    onUsersUpdate(handleUsersUpdate);

    return () => {
      leaveDocument(docId);
      socket.off('document-update', handleUpdate);
      socket.off('users-update', handleUsersUpdate);
    };
  }, [docId]);

  const applyOperation = (operation: Operation) => {
    sendOperation(docId, operation);
  };

  return { content, users, applyOperation };
};
