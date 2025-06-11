import React, { useState, useEffect, useRef } from 'react';
import { useDocument } from '../hooks/useDocument';
import { Operation } from '../models/types';
import UserList from './UserList';
import Toolbar from './Toolbar';

const Editor: React.FC<{ docId: string }> = ({ docId }) => {
  const { content, users, applyOperation } = useDocument(docId);
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldValue = localContent;
    
    // Simple diff - in production use a proper diffing algorithm
    let position = 0;
    while (position < oldValue.length && 
           position < newValue.length && 
           oldValue[position] === newValue[position]) {
      position++;
    }

    if (newValue.length > oldValue.length) {
      // Insertion
      const insertedText = newValue.slice(position, position + (newValue.length - oldValue.length));
      const operation: Operation = {
        type: 'insert',
        position,
        text: insertedText,
        version: 0 // Will be set by server
      };
      applyOperation(operation);
    } else if (newValue.length < oldValue.length) {
      // Deletion
      const operation: Operation = {
        type: 'delete',
        position,
        length: oldValue.length - newValue.length,
        version: 0 // Will be set by server
      };
      applyOperation(operation);
    }

    setLocalContent(newValue);
  };

  return (
    <div className="editor-container">
      <Toolbar docId={docId} />
      <UserList users={users} />
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        className="document-editor"
      />
    </div>
  );
};

export default Editor;
