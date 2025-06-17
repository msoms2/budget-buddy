<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->content,
            'data' => $this->data,
            'is_read' => !is_null($this->read_at),
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'created_at_human' => $this->created_at->diffForHumans(),
            'notification_type' => [
                'id' => $this->whenLoaded('notificationType', function () {
                    return $this->notificationType->id;
                }),
                'name' => $this->whenLoaded('notificationType', function () {
                    return $this->notificationType->name;
                }),
                'slug' => $this->whenLoaded('notificationType', function () {
                    return $this->notificationType->slug;
                }),
            ],
        ];
    }
}