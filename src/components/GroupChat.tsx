import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Send, MessageCircle, UserPlus, X, Users, Plus, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Checkbox } from './ui/checkbox';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  projectId: number;
}

interface GroupChatProps {
  currentUser: string;
  projects: Array<{
    id: number;
    title: string;
    groupMembers: string[];
    course?: string;
  }>;
  onUpdateMembers?: (projectId: number, members: string[]) => void;
  userType?: 'student' | 'admin';
  messages?: Message[];
  onUpdateMessages?: (messages: Message[]) => void;
}

export function GroupChat({ currentUser, projects, onUpdateMembers, userType = 'student', messages: externalMessages, onUpdateMessages }: GroupChatProps) {
  // Admins can see all project chats, students only see chats where they're members
  const userProjects = userType === 'admin' 
    ? projects 
    : projects.filter(project => project.groupMembers.includes(currentUser));

  const [selectedProjectId, setSelectedProjectId] = useState<number>(userProjects[0]?.id || 1);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatMembers, setNewChatMembers] = useState<string[]>([currentUser]);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [linkToProject, setLinkToProject] = useState(false);
  const [selectedProjectForLink, setSelectedProjectForLink] = useState<number | null>(null);
  
  // Use external messages if provided, otherwise use default local state
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  // Use external messages and setter if provided, otherwise use local state
  const messages = externalMessages || localMessages;
  const setMessages = onUpdateMessages || setLocalMessages;
  const [newMessage, setNewMessage] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [localProjects, setLocalProjects] = useState(projects);
  const [customChats, setCustomChats] = useState<Array<{
    id: number;
    title: string;
    groupMembers: string[];
    isCustom: true;
    linkedProjectId?: number;
  }>>([]);
  
  // Store phone numbers for members (member name -> phone number)
  const [memberPhones, setMemberPhones] = useState<Record<string, string>>({});

  // Combine regular projects with custom chats
  const allChats = [...localProjects.map(p => ({ ...p, isCustom: false as const })), ...customChats];
  const selectedChat = allChats.find(p => p.id === selectedProjectId);
  
  // Show messages for the selected project
  // All messages for a project are visible to members, including admin messages
  // Admin messages are specially styled with a blue badge and background
  const projectMessages = messages.filter(m => {
    if (m.projectId !== selectedProjectId) return false;
    // All messages for this project are visible (student messages + admin messages)
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });

    const message: Message = {
      id: messages.length + 1,
      sender: currentUser,
      content: newMessage,
      timestamp: timestamp,
      projectId: selectedProjectId
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      toast.error('Please enter a member name');
      return;
    }

    if (!newMemberPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate phone number is exactly 10 digits
    const digitsOnly = newMemberPhone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!selectedChat) return;

    // Check if member already exists
    if (selectedChat.groupMembers.includes(newMemberName.trim())) {
      toast.error('This member is already in the group');
      return;
    }

    const updatedMembers = [...selectedChat.groupMembers, newMemberName.trim()];
    
    // Store phone number for the member
    setMemberPhones(prev => ({
      ...prev,
      [newMemberName.trim()]: newMemberPhone.trim()
    }));
    
    // Update local state based on chat type
    if (selectedChat.isCustom) {
      setCustomChats(prev => prev.map(p => 
        p.id === selectedProjectId 
          ? { ...p, groupMembers: updatedMembers }
          : p
      ));
    } else {
      setLocalProjects(prev => prev.map(p => 
        p.id === selectedProjectId 
          ? { ...p, groupMembers: updatedMembers }
          : p
      ));

      // Notify parent component if callback provided
      if (onUpdateMembers) {
        onUpdateMembers(selectedProjectId, updatedMembers);
      }
    }

    toast.success(`${newMemberName.trim()} has been added to the group`);
    setNewMemberName('');
    setNewMemberPhone('');
    setIsAddMemberOpen(false);
  };

  const handleRemoveMember = (memberName: string) => {
    if (!selectedChat) return;

    // Prevent removing yourself
    if (memberName === currentUser) {
      toast.error('You cannot remove yourself from the group');
      return;
    }

    // Ensure at least one member remains
    if (selectedChat.groupMembers.length <= 1) {
      toast.error('Group must have at least one member');
      return;
    }

    const updatedMembers = selectedChat.groupMembers.filter(m => m !== memberName);
    
    // Update local state based on chat type
    if (selectedChat.isCustom) {
      setCustomChats(prev => prev.map(p => 
        p.id === selectedProjectId 
          ? { ...p, groupMembers: updatedMembers }
          : p
      ));
    } else {
      setLocalProjects(prev => prev.map(p => 
        p.id === selectedProjectId 
          ? { ...p, groupMembers: updatedMembers }
          : p
      ));

      // Notify parent component if callback provided
      if (onUpdateMembers) {
        onUpdateMembers(selectedProjectId, updatedMembers);
      }
    }

    toast.success(`${memberName} has been removed from the group`);
  };

  const [newMemberInputPhone, setNewMemberInputPhone] = useState('');
  
  const handleAddMemberToNewChat = () => {
    if (!newMemberInput.trim()) {
      toast.error('Please enter a member name');
      return;
    }

    if (!newMemberInputPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate phone number is exactly 10 digits
    const digitsOnly = newMemberInputPhone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (newChatMembers.includes(newMemberInput.trim())) {
      toast.error('This member is already added');
      return;
    }

    // Store phone number for the member
    setMemberPhones(prev => ({
      ...prev,
      [newMemberInput.trim()]: newMemberInputPhone.trim()
    }));

    setNewChatMembers([...newChatMembers, newMemberInput.trim()]);
    setNewMemberInput('');
    setNewMemberInputPhone('');
  };

  const handleRemoveMemberFromNewChat = (member: string) => {
    if (member === currentUser) {
      toast.error('You cannot remove yourself from the group');
      return;
    }
    setNewChatMembers(newChatMembers.filter(m => m !== member));
  };

  const handleCreateChat = () => {
    if (!newChatTitle.trim()) {
      toast.error('Please enter a chat title');
      return;
    }

    if (newChatMembers.length < 2) {
      toast.error('Group must have at least 2 members');
      return;
    }

    // Generate unique ID
    const newId = Math.max(
      ...localProjects.map(p => p.id),
      ...customChats.map(c => c.id),
      0
    ) + 1;

    const newChat = {
      id: newId,
      title: newChatTitle.trim(),
      groupMembers: newChatMembers,
      isCustom: true as const,
      linkedProjectId: linkToProject ? selectedProjectForLink || undefined : undefined
    };

    setCustomChats([...customChats, newChat]);
    setSelectedProjectId(newId);
    
    // Reset form
    setNewChatTitle('');
    setNewChatMembers([currentUser]);
    setNewMemberInput('');
    setLinkToProject(false);
    setSelectedProjectForLink(null);
    setIsCreateChatOpen(false);

    toast.success('Group chat created successfully!');
  };

  // Filter chats where user is a member
  const userChats = allChats.filter(chat => 
    chat.groupMembers.includes(currentUser)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
      {/* Project List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Chats</CardTitle>
              <CardDescription>
                Select or create a chat
              </CardDescription>
            </div>
            <Dialog open={isCreateChatOpen} onOpenChange={setIsCreateChatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Group Chat</DialogTitle>
                  <DialogDescription>
                    Create a new group chat and add members with their phone numbers.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Chat Title */}
                  <div className="space-y-2">
                    <Label htmlFor="chat-title">Chat Title</Label>
                    <Input
                      id="chat-title"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      placeholder="e.g., Study Group, Team Discussion"
                    />
                  </div>

                  {/* Link to Project */}
                  {localProjects.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="link-project"
                          checked={linkToProject}
                          onCheckedChange={(checked) => setLinkToProject(checked as boolean)}
                        />
                        <Label htmlFor="link-project" className="cursor-pointer">
                          Link to existing project
                        </Label>
                      </div>
                      {linkToProject && (
                        <select
                          className="w-full p-2 border rounded-md"
                          value={selectedProjectForLink || ''}
                          onChange={(e) => setSelectedProjectForLink(Number(e.target.value))}
                        >
                          <option value="">Select a project</option>
                          {localProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Current Members */}
                  <div className="space-y-2">
                    <Label>Members</Label>
                    <div className="space-y-2">
                      {newChatMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{member}</span>
                                {member === currentUser && (
                                  <Badge variant="secondary" className="text-xs">You</Badge>
                                )}
                              </div>
                              {memberPhones[member] && (
                                <p className="text-xs text-muted-foreground">{memberPhones[member]}</p>
                              )}
                            </div>
                          </div>
                          {member !== currentUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveMemberFromNewChat(member)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Member */}
                  <div className="space-y-2">
                    <Label htmlFor="add-member">Add Member</Label>
                    <div className="space-y-2">
                      <Input
                        id="add-member"
                        value={newMemberInput}
                        onChange={(e) => setNewMemberInput(e.target.value)}
                        placeholder="Enter member name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('add-member-phone')?.focus();
                          }
                        }}
                      />
                      <Input
                        id="add-member-phone"
                        type="tel"
                        value={newMemberInputPhone}
                        onChange={(e) => setNewMemberInputPhone(e.target.value)}
                        placeholder="10-digit phone number"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMemberToNewChat();
                          }
                        }}
                      />
                      <Button onClick={handleAddMemberToNewChat} size="sm" className="w-full">
                        Add Member
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateChatOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChat}>
                    Create Chat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {userChats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No group chats yet
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreateChatOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {userChats.map((chat) => {
                const chatMessageCount = messages.filter(m => m.projectId === chat.id).length;
                const isSelected = selectedProjectId === chat.id;
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedProjectId(chat.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate ${isSelected ? '' : 'text-muted-foreground'}`}>
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>{chat.groupMembers.length} members</span>
                          {chat.isCustom && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs px-1">Custom</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {chatMessageCount > 0 && (
                        <Badge variant="secondary" className="ml-auto flex-shrink-0">
                          {chatMessageCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle>{selectedChat?.title}</CardTitle>
                  <CardDescription>
                    Chat with your team members • {selectedChat?.groupMembers.length} members
                  </CardDescription>
                </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Group Members</DialogTitle>
                    <DialogDescription>
                      Add or remove members from this project group. Only group members can access the chat.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Contact Info Alert */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>How to Contact Group Members:</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-3 mt-2">
                          <div>
                            <p className="text-sm mb-2"><strong>1. Save the Number in Your Phone:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                              <li>Open your phone's Contacts app.</li>
                              <li>Create a new contact.</li>
                              <li>Enter the person's name and their phone number (make sure to include the correct country code, e.g., +1 for the USA).</li>
                              <li>Save the contact.</li>
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-2"><strong>2. Open Your Messaging App:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                              <li>Open your preferred messaging app (WhatsApp, Telegram, etc.).</li>
                              <li>Tap the Chat or New Contact option.</li>
                              <li>The app will sync with your phone contacts and display your saved contacts.</li>
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-2"><strong>3. Start Communicating:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                              <li>Find the contact you just saved.</li>
                              <li>Tap on their name to open a chat or call.</li>
                              <li>Send them a message or make a call.</li>
                            </ul>
                          </div>
                          
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm mb-2"><strong>Notes:</strong></p>
                            <ul className="space-y-1 text-sm">
                              <li>• If the contact isn't using a messaging app yet, you won't see them in that app.</li>
                              <li>• Make sure the phone number is saved in the international format with the correct country code, otherwise messaging apps may not recognize it.</li>
                              <li>• Messaging apps automatically sync your phone contacts periodically, so sometimes it might take a few moments for a new contact to appear.</li>
                            </ul>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                    {/* Current Members */}
                    <div>
                      <Label>Current Members</Label>
                      <div className="mt-2 space-y-2">
                        {selectedChat?.groupMembers.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(member)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span>{member}</span>
                                  {member === currentUser && (
                                    <Badge variant="secondary">You</Badge>
                                  )}
                                </div>
                                {memberPhones[member] && (
                                  <p className="text-sm text-muted-foreground">{memberPhones[member]}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member)}
                              disabled={member === currentUser}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add New Member */}
                    <div>
                      <Label htmlFor="new-member">Add New Member</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          id="new-member"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Enter member name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              document.getElementById('new-member-phone')?.focus();
                            }
                          }}
                        />
                        <Input
                          id="new-member-phone"
                          type="tel"
                          value={newMemberPhone}
                          onChange={(e) => setNewMemberPhone(e.target.value)}
                          placeholder="10-digit phone number"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMember();
                            }
                          }}
                        />
                        <Button onClick={handleAddMember} className="w-full">
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        {/* Messages */}
        <CardContent className="flex-1 flex flex-col min-h-0 pb-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {projectMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                projectMessages.map((message) => {
                  const isCurrentUser = message.sender === currentUser;
                  // Check if the sender is an admin: when viewing as student, if sender is not in group members, it's an admin message
                  // Admin messages are ALWAYS visible to students and get special blue styling
                  const isAdminMessage = userType === 'student' && !selectedChat?.groupMembers.includes(message.sender);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                          <span className={`${isCurrentUser ? 'order-2' : ''}`}>
                            {message.sender}
                          </span>
                          {isAdminMessage && (
                            <Badge variant="default" className="text-xs px-1.5 py-0">Admin</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </span>
                        </div>
                        <div
                          className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : isAdminMessage
                              ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t pt-4 pb-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a chat from the sidebar or create a new one
              </p>
              <Button onClick={() => setIsCreateChatOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group Chat
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
