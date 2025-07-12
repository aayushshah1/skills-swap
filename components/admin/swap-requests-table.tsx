"use client"

import * as React from "react"
import { MoreHorizontal, Search, Edit, Trash2, CheckCircle, X, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type SwapRequest = {
  id: number
  requester_uid: string
  skill_offered: string
  skill_requested: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  requester: {
    uid: string
    first_name: string | null
    last_name: string | null
    display_name: string | null
    public: boolean | null
    location: string | null
    availability: string[] | null
    photo_url: string | null
    created_at: string
    roles: string | null
  }
}

interface SwapRequestsTableProps {
  swapRequests: SwapRequest[]
}

export function SwapRequestsTable({ swapRequests }: SwapRequestsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredRequests = swapRequests.filter(request => {
    const displayName = request.requester.display_name || 
      `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim()
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = displayName.toLowerCase().includes(searchLower) ||
           request.skill_offered.toLowerCase().includes(searchLower) ||
           request.skill_requested.toLowerCase().includes(searchLower) ||
           request.description?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredRequests.length} of {swapRequests.length} requests
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                const displayName = request.requester.display_name || 
                  `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim() || 'Anonymous'
                
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester.photo_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.requester.location || 'Location not set'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Offers:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {request.skill_offered}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Wants:</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {request.skill_requested}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {request.description || 'No description provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(request.id.toString())}
                          >
                            Copy request ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No swap requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
