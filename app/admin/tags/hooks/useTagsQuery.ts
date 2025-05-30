import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, fetchTags, addTag, updateTag, deleteTag } from '../lib/tag-service';
import { useToast } from '@/components/ui/use-toast';
import { processTagsForTable, TagRow } from '../lib/utils';

// Query keys
export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (filters: { activeOnly?: boolean; category?: string }) => 
    [...tagsKeys.lists(), filters] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
};

export function useTagsQuery(activeOnly = false, category?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching tags
  const tagsQuery = useQuery({
    queryKey: tagsKeys.list({ activeOnly, category }),
    queryFn: () => fetchTags(activeOnly, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Process tags for table display
  const tagRows: TagRow[] = tagsQuery.data ? processTagsForTable(tagsQuery.data) : [];
  
  // Mutation for adding a tag
  const addTagMutation = useMutation({
    mutationFn: addTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast({ title: "Success", description: "Tag added successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tag",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for updating a tag
  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>> }) => 
      updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast({ title: "Success", description: "Tag updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tag",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a tag
  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast({ title: "Success", description: "Tag deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Data and states
    tags: tagsQuery.data || [],
    tagRows,
    isLoading: tagsQuery.isPending,
    isError: tagsQuery.isError,
    error: tagsQuery.error,
    
    // Operations
    refetch: tagsQuery.refetch,
    
    // Mutations
    addTag: (data: { name: string; category?: string; active: boolean }): Promise<void> => 
      addTagMutation.mutateAsync({
        name: data.name,
        category: data.category || 'General',
        active: data.active
      }).then(() => {}),
    isAddingTag: addTagMutation.isPending,
    
    updateTag: (id: string, data: Partial<Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>>): Promise<void> => 
      updateTagMutation.mutateAsync({ id, data }).then(() => {}),
    isUpdatingTag: updateTagMutation.isPending,
    
    deleteTag: (id: string): Promise<void> => deleteTagMutation.mutateAsync(id).then(() => {}),
    isDeletingTag: deleteTagMutation.isPending,
  };
} 