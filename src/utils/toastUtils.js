import toast from "react-hot-toast";

/**
 * Display a loading toast with a unique ID
 * @param {string} message - Message to display
 * @param {string} id - Unique ID for the toast
 * @returns {string} - The toast ID
 */
export const showLoadingToast = (message, id) => {
  return toast.loading(message, { id });
};

/**
 * Display a success toast that replaces an existing loading toast
 * @param {string} message - Success message
 * @param {string} id - ID of the toast to update
 * @param {number} duration - Duration in ms (default: 2000)
 */
export const showSuccessToast = (message, id, duration = 2000) => {
  toast.success(message, { id, duration });
};

/**
 * Display an error toast that replaces an existing loading toast
 * @param {string} message - Error message
 * @param {string} id - ID of the toast to update
 * @param {number} duration - Duration in ms (default: 2000)
 */
export const showErrorToast = (message, id, duration = 2000) => {
  toast.error(message, { id, duration });
};

/**
 * Create a unique toast ID based on action and entity
 * @param {string} action - Action being performed (e.g., "add", "remove")
 * @param {string} entityType - Type of entity (e.g., "movie", "person")
 * @param {string|number} entityId - ID of the entity
 * @returns {string} - Unique toast ID
 */
export const createToastId = (action, entityType, entityId) => {
  return `${action}-${entityType}-${entityId}`;
};

/**
 * Handle a list action with appropriate toast notifications
 * @param {Function} actionFn - Async function to perform the action
 * @param {object} entity - Entity to act upon
 * @param {string} action - Action type ("add" or "remove")
 * @param {Function} onSuccess - Function to call on success
 * @returns {Promise<boolean>} - Success status
 */
export const handleListAction = async (actionFn, entity, action, onSuccess) => {
  const entityName = entity.title || entity.name || "Item";
  const entityId = entity.id;
  const entityType = entity.title ? "movie" : "person";
  
  const isAdding = action === "add";
  const actionVerb = isAdding ? "Adding" : "Removing";
  const actionPast = isAdding ? "added to" : "removed from";
  
  // Generate toast ID
  const toastId = createToastId(action, entityType, entityId);
  
  try {
    // Show loading toast
    showLoadingToast(`${actionVerb} ${entityName} ${isAdding ? "to" : "from"} your list...`, toastId);
    
    // Perform the action
    const success = await actionFn(entity);
    
    if (success) {
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
      // Show success toast
      showSuccessToast(`${entityName} ${actionPast} your list`, toastId);
      return true;
    } else {
      // Show error toast
      showErrorToast(`Failed to ${action} ${entityName} ${isAdding ? "to" : "from"} your list`, toastId);
      return false;
    }
  } catch (error) {
    console.error(`Error ${action}ing ${entityType}:`, error);
    
    // Show error toast with error message
    const errorToastId = `error-${action}-${entityType}-${entityId}`;
    showErrorToast(`Error: ${error.message || `Failed to ${action}`}`, errorToastId);
    
    return false;
  }
}; 