import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Facebook, Instagram, Linkedin, Send, Loader2, Sparkles, Clock, Target } from 'lucide-react';

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
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-social-facebook', bgColor: 'bg-social-facebook/10', borderColor: 'border-social-facebook/30' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-social-instagram', bgColor: 'bg-social-instagram/10', borderColor: 'border-social-instagram/30' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-social-linkedin', bgColor: 'bg-social-linkedin/10', borderColor: 'border-social-linkedin/30' },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-glow/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto p-6 pt-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary animate-glow" />
            <span className="text-sm font-medium text-primary">Social Media Automation Studio</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Create & Schedule
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Streamline your social media presence with intelligent automation across multiple platforms
          </p>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-xl bg-card/80 border-0 shadow-2xl shadow-primary/5 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-display font-semibold text-foreground">
              New Content Submission
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Fill out the details below to schedule your content across social platforms
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Post Title */}
                    <FormField
                      control={form.control}
                      name="postTitle"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Post Title
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a compelling title that grabs attention..."
                              className="h-14 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-base">
                            A catchy headline that summarizes your content ({field.value?.length || 0}/100)
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-semibold text-foreground">
                            Caption
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your engaging post content here... Tell your story, share insights, or inspire your audience!"
                              className="min-h-40 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-base">
                            Your main message ({field.value?.length || 0}/2200 characters)
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-semibold text-foreground">
                            Hashtags
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="#marketing #socialmedia #automation #growth #business"
                              className="h-14 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-base">
                            Add relevant hashtags to increase discoverability
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Platform Selection */}
                    <FormField
                      control={form.control}
                      name="platforms"
                      render={() => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-semibold text-foreground">
                            Target Platforms
                          </FormLabel>
                          <div className="grid gap-4">
                            {platforms.map((platform) => (
                              <FormField
                                key={platform.id}
                                control={form.control}
                                name="platforms"
                                render={({ field }) => {
                                  const IconComponent = platform.icon;
                                  const isSelected = field.value?.includes(platform.id);
                                  return (
                                    <div className={cn(
                                      "relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group",
                                      isSelected 
                                        ? `${platform.bgColor} ${platform.borderColor} shadow-lg scale-[1.02]`
                                        : "bg-background/30 border-border/30 hover:border-primary/30 hover:bg-background/50"
                                    )}>
                                      <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, platform.id])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== platform.id)
                                                  );
                                            }}
                                            className="h-5 w-5"
                                          />
                                        </FormControl>
                                        <FormLabel className="flex items-center space-x-3 cursor-pointer flex-1">
                                          <IconComponent className={cn("h-6 w-6", platform.color)} />
                                          <span className="text-base font-medium">{platform.name}</span>
                                        </FormLabel>
                                      </FormItem>
                                      {isSelected && (
                                        <div className="absolute top-2 right-2">
                                          <div className="h-2 w-2 bg-primary rounded-full animate-glow"></div>
                                        </div>
                                      )}
                                    </div>
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Schedule Date & Time
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-14 pl-4 text-left font-normal bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    <div className="flex items-center gap-3">
                                      <CalendarIcon className="h-5 w-5 text-primary" />
                                      <span className="text-base">{format(field.value, "PPP 'at' p")}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                      <span>Select date and time</span>
                                    </div>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-xl border-primary/20" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-4 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription className="text-base">
                            Choose when your content should go live
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Media Upload Section */}
                <div className="space-y-6 pt-4">
                  <FormLabel className="text-lg font-semibold text-foreground">
                    Media Assets
                  </FormLabel>
                  
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-primary/30 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-glow/5 hover:from-primary/10 hover:to-primary-glow/10 transition-all duration-300 cursor-pointer group"
                    >
                      <Upload className="h-16 w-16 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Upload Visual Content</h3>
                      <p className="text-base text-muted-foreground text-center">
                        Drag & drop images here or click to browse<br />
                        <span className="text-sm">Supports JPG, PNG • Max 4 files • 10MB each</span>
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-scale-in">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-xl border-2 border-border/30 bg-background/30 p-2">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Webhook URL */}
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold text-foreground">
                        Automation Webhook URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://your-automation-service.com/webhook"
                          className="h-14 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        The endpoint where your automation service (n8n, Zapier, Make) will receive the data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-lg font-semibold"
                    variant="premium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Processing Your Content...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-6 w-6" />
                        Launch Content Automation
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