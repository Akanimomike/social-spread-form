import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Facebook, Instagram, Linkedin, Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  postTitle: z.string().min(1, 'Post title is required').max(100, 'Post title must be under 100 characters'),
  caption: z.string().min(1, 'Caption is required').max(2200, 'Caption must be under 2200 characters'),
  hashtags: z.string().optional(),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduledDate: z.date({
    required_error: 'Please select a date and time for posting',
  }),
  webhookUrl: z.string().url('Please enter a valid webhook URL'),
});

type FormData = z.infer<typeof formSchema>;

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'social-facebook' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'social-instagram' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'social-linkedin' },
];

export default function SocialMediaForm() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postTitle: '',
      caption: '',
      hashtags: '',
      platforms: [],
      webhookUrl: '',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length + uploadedImages.length > 4) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 4 images.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add form data
      formData.append('postTitle', data.postTitle);
      formData.append('caption', data.caption);
      formData.append('hashtags', data.hashtags || '');
      formData.append('platforms', JSON.stringify(data.platforms));
      formData.append('scheduledDate', data.scheduledDate.toISOString());
      
      // Add images
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch(data.webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Content submitted successfully!',
          description: 'Your social media post has been queued for automation.',
        });
        
        // Reset form
        form.reset();
        setUploadedImages([]);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Please check your webhook URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Social Media Automation
          </h1>
          <p className="text-lg text-muted-foreground">
            Schedule and automate your social media content across multiple platforms
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create New Post</CardTitle>
            <CardDescription>
              Fill out the form below to schedule your content across social platforms
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Post Title */}
                <FormField
                  control={form.control}
                  name="postTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Post Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a catchy title for your post..."
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short, engaging title for your social media post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Caption */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Caption</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your post caption here..."
                          className="min-h-32 text-base resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of your post ({field.value?.length || 0}/2200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hashtags */}
                <FormField
                  control={form.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Hashtags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="#socialmedia #automation #marketing"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add relevant hashtags separated by spaces or commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Media Upload */}
                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Media Upload</FormLabel>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Upload Images</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose up to 4 images (JPG, PNG, max 10MB each)
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Platform Selection */}
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Platforms to Post To</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        {platforms.map((platform) => (
                          <FormField
                            key={platform.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              const IconComponent = platform.icon;
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(platform.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, platform.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== platform.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="flex items-center space-x-2 text-sm font-normal cursor-pointer">
                                    <IconComponent className="h-5 w-5" />
                                    <span>{platform.name}</span>
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Scheduled Date Time */}
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-semibold">Scheduled Post Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Choose when you want this post to be published
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Webhook URL */}
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Webhook URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://your-automation-webhook-url.com"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The webhook URL where the form data will be sent for automation (e.g., n8n, Zapier)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg"
                    variant="gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit for Automation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}