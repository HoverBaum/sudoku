import { toast } from 'sonner'

export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string }) => {
      toast(props.title, {
        description: props.description,
      })
    },
  }
}
