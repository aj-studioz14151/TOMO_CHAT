"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "ui/dropdown-menu";
import { AvatarFallback, AvatarImage, Avatar } from "ui/avatar";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenu } from "ui/sidebar";
import {
  ChevronsUpDown,
  Command,
  LogOutIcon,
  Settings2,
  Palette,
  Languages,
  Sun,
  MoonStar,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { appStore } from "@/app/store";
import { BASE_THEMES, COOKIE_KEY_LOCALE, SUPPORTED_LOCALES } from "lib/const";
import { capitalizeFirstLetter, cn, fetcher } from "lib/utils";
import { authClient } from "auth/client";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { getLocaleAction } from "@/i18n/get-locale";
import { Suspense, useCallback } from "react";
import { GithubIcon } from "ui/github-icon";
import { DiscordIcon } from "ui/discord-icon";
import { useThemeStyle } from "@/hooks/use-theme-style";
import { BasicUser } from "app-types/user";
import { getUserAvatar } from "lib/user/utils";
import { Skeleton } from "ui/skeleton";

export function AppSidebarUserInner(props: {
  user?: BasicUser;
}) {
  const { data: user } = useSWR<BasicUser>(`/api/user/details`, fetcher, {
    fallbackData: props.user,
    suspense: true,
    revalidateOnMount: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    refreshInterval: 1000 * 60 * 10,
  });
  const appStoreMutate = appStore((state) => state.mutate);
  const t = useTranslations("Layout");

  const logout = () => {
    authClient.signOut().finally(() => {
      window.location.href = "/sign-in";
    });
  };

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-input/30 border"
              size={"lg"}
              data-testid="sidebar-user-button"
            >
              <Avatar className="rounded-full size-8 border">
                <AvatarImage
                  className="object-cover"
                  src={getUserAvatar(user)}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{user?.name?.slice(0, 1) || ""}</AvatarFallback>
              </Avatar>
              <span className="truncate" data-testid="sidebar-user-email">
                {user?.email}
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="bg-background w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            align="center"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src={getUserAvatar(user)}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.slice(0, 1) || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span
                    className="truncate font-medium"
                    data-testid="sidebar-user-name"
                  >
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => appStoreMutate({ openChatPreferences: true })}
            >
              <Settings2 className="size-4 text-foreground" />
              <span>{t("chatPreferences")}</span>
            </DropdownMenuItem>
            <MobileThemeToggle />
            <SelectTheme />
            <SelectLanguage />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => appStoreMutate({ openShortcutsPopup: true })}
            >
              <Command className="size-4 text-foreground" />
              <span>{t("keyboardShortcuts")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.open(
                  "https://github.com/kamesh6592-cell/hello-its/issues/new",
                  "_blank",
                );
              }}
            >
              <GithubIcon className="size-4 fill-foreground" />
              <span>{t("reportAnIssue")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.open("https://discord.gg/gCRu69Upnp", "_blank");
              }}
            >
              <DiscordIcon className="size-4 fill-foreground" />
              <span>{t("joinCommunity")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => appStoreMutate({ openUserSettings: true })}
              className="cursor-pointer"
              data-testid="user-settings-menu-item"
            >
              <Settings className="size-4 text-foreground" />
              <span>User Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOutIcon className="size-4 text-foreground" />
              <span>{t("signOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Mobile-friendly theme toggle component
function MobileThemeToggle() {
  const t = useTranslations("Layout");
  const { theme = "light", setTheme } = useTheme();

  return (
    <DropdownMenuItem
      className="cursor-pointer sm:hidden"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <div className="flex items-center gap-3 w-full">
        <Palette className="size-4 text-foreground" />
        <span>{t("theme")}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {capitalizeFirstLetter(theme)}
          </span>
          <div className="flex items-center border rounded-full p-0.5">
            <div
              className={cn(
                "p-1 rounded-full transition-all",
                theme === "dark" && "bg-primary text-primary-foreground"
              )}
            >
              <MoonStar className="size-3" />
            </div>
            <div
              className={cn(
                "p-1 rounded-full transition-all",
                theme === "light" && "bg-primary text-primary-foreground"
              )}
            >
              <Sun className="size-3" />
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}

function SelectTheme() {
  const t = useTranslations("Layout");

  const { theme = "light", setTheme } = useTheme();

  const { themeStyle = "default", setThemeStyle } = useThemeStyle();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="hidden sm:flex items-center"
        icon={
          <>
            <span className="text-muted-foreground text-xs min-w-0 truncate">
              {`${capitalizeFirstLetter(theme)} ${capitalizeFirstLetter(
                themeStyle,
              )}`}
            </span>
            <ChevronRight className="size-4 ml-2" />
          </>
        }
      >
        <Palette className="mr-2 size-4" />
        <span className="mr-auto">{t("theme")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-56 sm:w-48 z-[100] max-h-[80vh] overflow-y-auto">
          <DropdownMenuLabel className="text-muted-foreground w-full flex items-center py-3">
            <span className="text-sm mr-3 select-none font-medium">
              {capitalizeFirstLetter(theme)}
            </span>
            <div className="flex-1" />

            <div
              onClick={(e) => {
                e.stopPropagation();
                setTheme(theme === "light" ? "dark" : "light");
              }}
              className="cursor-pointer border-2 rounded-full flex items-center p-0.5 transition-all duration-200 hover:shadow-md"
              role="button"
              tabIndex={0}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full transition-all duration-200",
                  theme === "dark" &&
                    "bg-primary text-primary-foreground shadow-sm",
                  theme === "light" && "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoonStar className="size-3.5" />
              </div>
              <div
                className={cn(
                  "p-1.5 rounded-full transition-all duration-200",
                  theme === "light" &&
                    "bg-primary text-primary-foreground shadow-sm",
                  theme === "dark" && "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="size-3.5" />
              </div>
            </div>
          </DropdownMenuLabel>
          <div className="max-h-96 overflow-y-auto">
            {BASE_THEMES.map((t) => (
              <DropdownMenuCheckboxItem
                key={t}
                checked={themeStyle === t}
                onClick={(e) => {
                  e.preventDefault();
                  setThemeStyle(t);
                }}
                className="text-sm"
              >
                {capitalizeFirstLetter(t)}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

function SelectLanguage() {
  const t = useTranslations("Layout");
  const { data: currentLocale } = useSWR(COOKIE_KEY_LOCALE, getLocaleAction, {
    fallbackData: SUPPORTED_LOCALES[0].code,
    revalidateOnFocus: false,
  });
  const handleOnChange = useCallback((locale: string) => {
    document.cookie = `${COOKIE_KEY_LOCALE}=${locale}; path=/;`;
    window.location.reload();
  }, []);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="mr-2 size-4" />
        <span>{t("language")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-48 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="text-muted-foreground">
            {t("language")}
          </DropdownMenuLabel>
          {SUPPORTED_LOCALES.map((locale) => (
            <DropdownMenuCheckboxItem
              key={locale.code}
              checked={locale.code === currentLocale}
              onCheckedChange={() =>
                locale.code !== currentLocale && handleOnChange(locale.code)
              }
            >
              {locale.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export function AppSidebarUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-input/30 border"
          size={"lg"}
          data-testid="sidebar-user-button"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebarUser({
  user,
}: {
  user?: BasicUser;
}) {
  return (
    <Suspense fallback={<AppSidebarUserSkeleton />}>
      <AppSidebarUserInner user={user} />
    </Suspense>
  );
}
